from django.conf.urls import url, include

from controllers import GameListController, GameController, PlayerController, GamePlayerController, PlayerResetController, LogoutController

app_urls = [
    url(r'^game/(?P<game>[^/]+)/player/?$', GamePlayerController()),
    url(r'^game/?$', GameController()),
    url(r'^games/?$', GameListController()),
    url(r'^player/?$', PlayerController()),
    url(r'^player/reset/?$', PlayerResetController()),
    url(r'^logout/?$', LogoutController())
]

urlpatterns = [
    url(r'^api/?', include(app_urls)),
    url(r'', include(app_urls))
]
