#!/usr/bin/env python
import os
import sys
import yaml
import argparse


parser = argparse.ArgumentParser()
parser.add_argument("command", help="manage command to run")
parser.add_argument("-m", dest="hostname",
                    help="machine hostname to execute command on")
parser.add_argument("-s", dest="service",
                    help="django service to interact with", default="encast")
parser.add_argument("command_args", nargs=argparse.REMAINDER)


service_config = yaml.load(open('local.yml').read())
services = service_config["services"]
vms = service_config.get("vagrant", {}).get("vms", [])


def main():
    args = parser.parse_args()
    hostname = args.hostname
    manage_command = args.command
    manage_command_args = args.command_args

    service = services[args.service]

    vm = get_vm_for_hostname(args.hostname)
    if vm:
        target = vm['ip']
        print "Found vm %s at %s" % (vm['hostname'], target)

    else:
        target = hostname

    manage_command_string = ('ssh -t devops@{target} -i {devops_key} "source {virtualenv}/bin/activate &&'
                             'cd {manage_path} && python manage.py {manage_command} {manage_command_args}"')

    command = manage_command_string.format(manage_path=service['django_root'],
                                           virtualenv=service_config['virtualenv'],
                                           target=target, manage_command=manage_command, devops_key=service_config[
                                               'devops']['key'],
                                           manage_command_args=' '.join(manage_command_args))

    print command

    os.system(command)


def get_vm_for_hostname(hostname=None):
    if hostname is None:
        if not vms:
            print "No vms in vagrant config and no hostname provided, exiting..."
            sys.exit()
        return vms[0]

    matching_vms = [vm for vm in vms if vm.get("hostname", "") == hostname]
    if matching_vms:
        return matching_vms[0]
    return None


def try_ping(website):
    print "pinging " + website
    import re
    import subprocess
    try:
        ping = subprocess.Popen(
            ["ping", "-n", "-c 2", website], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, error = ping.communicate()
        if out:
            try:
                received = int(re.findall(r"(\d+) bytes from", out)[0])
            except:
                return False
        else:
            return False

    except subprocess.CalledProcessError:
        return False

    return received

if __name__ == "__main__":
    main()
