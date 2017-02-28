from django.conf.urls import url

from controllers import GameNodeController

urlpatterns = [
    url(r'^node/?$', GameNodeController()),
]
