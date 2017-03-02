from django.conf.urls import url

from controllers import GameListController, GameController, PlayerController, GamePlayerController

urlpatterns = [
    url(r'^game/(?P<game>[^/]+)/player/?$', GamePlayerController()),
    url(r'^game/?$', GameController()),
    url(r'^games/?$', GameListController()),
    url(r'^player/?$', PlayerController()),
]
