##Dependencies
* Ansible 2.1.1.0

This is a python lib and can be installed (if you have pip) with

`pip install ansible==2.1.1.0`

if you do not have pip, get it like so (on mac/linux)

`sudo easy_install pip`

* Vagrant 1.8.5

Get it here: http://www.vagrantup.com/downloads-archive.html

* VirtualBox

Get it here: https://www.virtualbox.org/wiki/Downloads

## Get going:

1. Copy local.yml.example to local.yml,
2. make sure `devops.key` , `devops.public_key`,are paths on your system that make sense. You can use any valid keypair.
3. `vagrant up`
4. Grab a cup of coffee
5. place your secrets.yml file in ansible/vars/secrets.yml (sensitive data, not version controlled)
6. install local machine dependencies `pip install -r requirements.txt && sudo apt-get install libpq-dev`
7. `./deploy.py local`


example deploy.py commands:

pass tag 'update':

`./deploy.py local -t update`

rebuild webservers on dev:

`./deploy.py dev -r webservers`

verbosity:

`./deploy.py dev -t update -vvvv`

bounce tag on prod with a little verbosity:

`./deploy.py prod -t bounce -vv`
