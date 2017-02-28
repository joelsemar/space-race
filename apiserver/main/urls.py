from django.conf.urls import url

from controllers import GameListController, GameController, PlayerController

urlpatterns = [
    url(r'^game/(?P<game>[^/]+)/player/?$', PlayerController()),
    url(r'^game/?$', GameController()),
    url(r'^games/?$', GameListController()),
]
