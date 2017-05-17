#!/usr/bin/env python
import os
import sys
import yaml
import argparse
import subprocess


parser = argparse.ArgumentParser()
parser.add_argument("env", help="local|dev|prod|etc", default="local")
parser.add_argument("-r", "--role", dest="role", help="appservers|dbservers|workers|all|etc", default="site")
parser.add_argument("-t", dest="tags", help="tag value", default='', required=False)
parser.add_argument("-v", dest="verbosity", help="ansible verbosity", default='')
parser.add_argument("--react-app-location", help="location of the react app", dest="react_app_location")
parser.add_argument('--bootstrap', dest='run_bootstrap', action='store_true',
                    help="boot strap env with devops keys and necessary users")
parser.add_argument("-u", dest="local_user", help="local user to run with devlocalserver role", default='joel')

args = parser.parse_args()


if args.role == 'all':
    args.role = 'site'

if args.tags:
    args.tags = "--tags=" + args.tags

if args.verbosity:
    args.verbosity = "-" + args.verbosity

app_config = yaml.load(open('local.yml').read())

os.chdir('ansible')

extra_args = ''
if args.env == "local" or args.env == "vm":
    bootstrap_user = 'vagrant'
    extra_args = "-e '@../local.yml'"
    bootstrap_key = "~/.vagrant.d/insecure_private_key"

else:
    bootstrap_user = 'root'
    bootstrap_key = app_config['devops']['key']


extra_args += ' --extra-vars "env={env}"'.format(env=args.env)
if args.react_app_location:
    extra_args += ' --extra-vars "react_app_location=%s"' % (args.react_app_location)
elif app_config.get("react_app_location"):
    extra_args += ' --extra-vars "react_app_location=%s"' % (app_config['react_app_location'])


if app_config.get("secrets"):
    extra_args += ' --extra-vars "secrets={secrets}"'.format(secrets=app_config.get("secrets"))

if args.role != "devlocalserver":
    bootstrap_command = "ansible-playbook {verbosity} -u {bootstrap_user} -i hosts/{env} {extra_args} --private-key={bootstrap_key} bootstrap.yml"
    main_command = "ansible-playbook {verbosity} -u devops -i hosts/{env} {extra_args}  --private-key={key} {tags} {role}.yml"

    if args.run_bootstrap:
        command_string = "%s && %s" % (bootstrap_command, main_command)
    else:
        command_string = main_command

    command = command_string.format(
        env=args.env, key=app_config['devops']['key'], tags=args.tags, role=args.role,
        verbosity=args.verbosity, bootstrap_user=bootstrap_user, extra_args=extra_args, bootstrap_key=bootstrap_key)
else:
    command_string = """
    export ANSIBLE_SCP_IF_SSH=y; ansible-playbook {verbosity} -u devops -i hosts/{env} {extra_args} -u {user}  --private-key={key} {tags} {role}.yml --ask-sudo-pass
    """
    command = command_string.format(
        env=args.env, key=app_config['devops']['key'], tags=args.tags, role=args.role,
        verbosity=args.verbosity, bootstrap_user=bootstrap_user, extra_args=extra_args, bootstrap_key=bootstrap_key, user=args.local_user)


sys.exit(subprocess.call(command, shell=True))
