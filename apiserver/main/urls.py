from django.conf.urls import url

from controllers import GameListController, GameController, PlayerController, GamePlayerController, PlayerResetController, LogoutController

urlpatterns = [
    url(r'^game/(?P<game>[^/]+)/player/?$', GamePlayerController()),
    url(r'^game/?$', GameController()),
    url(r'^games/?$', GameListController()),
    url(r'^player/?$', PlayerController()),
    url(r'^player/reset/?$', PlayerResetController()),
    url(r'^logout/?$', LogoutController())
]
