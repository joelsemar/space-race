import os
ENV = "LOCAL"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NODE_HOSTS = ["10.10.10.100", "192.168.0.2"]
LOBBY_LOCATION = "http://127.0.0.1:3000"
GAME_LOCATION = "http://127.0.0.1:8000/play"  
#LOBBY_LOCATION = 'http://local.planetgrab.com/'
#GAME_LOCATION = 'http://local.planetgrab.com/play'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

LOG_FILE = os.path.join('/home/joel/space-race/logs/apiserver', "apiserver.log")

STATICFILES_DIRS = ["/home/joel/space-race/gameserver/client/"]
