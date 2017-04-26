from __future__ import absolute_import

import os

from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apiserver.settings')

from django.conf import settings
from celery.schedules import crontab


app = Celery('apiserver')

