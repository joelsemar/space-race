#!/usr/bin/env python
import os
import sys
import yaml

if len(sys.argv) == 1:
    print "vagrant vm name required"
    sys.exit()

if len(sys.argv) == 2:
    print "manage command required"
    sys.exit()


vagrant_vm_name = sys.argv[1]
manage_command = sys.argv[2]
manage_command_args = sys.argv[3:]

app_config = yaml.load(open('app.conf').read())
ip_command = "ifconfig eth1 | grep 'inet addr'| cut -d' ' -f12 | cut -c 6-"
ip_command_string = 'vagrant ssh {vagrant_vm_name} -c "{ip_command}"'.format(vagrant_vm_name=vagrant_vm_name, 
                                                                           ip_command=ip_command)
ip_addr = os.popen(ip_command_string).read().strip()

manage_command_string = ('ssh -t devops@{ip_addr} -i ~/.ssh/peppered_devops "source /opt/{app_name}/python-virtual/bin/activate &&'
                        'python /opt/{app_name}/server/manage.py {manage_command} {manage_command_args}"')


command =  manage_command_string.format(app_name=app_config['app_name'], 
                                       ip_addr=ip_addr, manage_command=manage_command,
                                       manage_command_args=' '.join(manage_command_args))

os.system(command)
