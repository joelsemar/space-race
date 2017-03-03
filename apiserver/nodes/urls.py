from django.conf.urls import url

from controllers import GameNodeController, ChatNodeController

urlpatterns = [
    url(r'^node/?$', GameNodeController()),
    url(r'^chatnode/?$', ChatNodeController()),

]
