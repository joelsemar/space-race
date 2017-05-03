import os, sys

DEBUG = True
ENV = "LOCAL"

MEDIA_ROOT = "/srv/space-race/media/"
STATIC_ROOT = "/srv/space-race/static/"
STATIC_URL = "/static/"




DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'space-race',
        'USER': 'space-race',
        'PASSWORD': 'space-race',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
BROKER_URL = "redis://127.0.0.1:6379/2"



LOG_FILE = os.path.join('/srv/space-race/logs/apiserver', "apiserver.log")
LOG_FILE = os.path.join('/home/joel/space-race/logs/apiserver', "apiserver.log")
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(asctime)s -- %(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter':'simple',
        },
        'default':{
            'level': 'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename': LOG_FILE,
            'maxBytes': 1024*1024*5, # 5 MB
            'backupCount': 5,
            'formatter':'simple',

        },
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
    },
    'loggers': {
        'default': {
                      'handlers': ['default', 'console'],
                      'level': 'DEBUG',
        },
        'apnsclient.apns': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },
        'apnsclient.transport': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },
        'apnsclients.backends.stdio': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },
        'concurrent.futures': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },
        'django.request': {
            'handlers': ['default'],
            'level': 'DEBUG',
        },

        'django.db.backends': {
            'handlers': ['default'],
            'propagate': True,
            'level': 'INFO',
        },
    }
}
try:
    from apiserver.local_settings import *
except ImportError:
    pass

