"""apiserver URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve

from django.conf import settings
from main import urls as main_urls
from nodes import urls as node_urls
from services.apps.docgen import urls as docgen_urls


def serve_html(request, file_name):
    if not file_name:
        file_name = 'index'

    file_path = '{}.html'.format(file_name)

    # Use Django staticfiles's serve view.
    return serve(request, file_path,)


urlpatterns = [
    url(r'^admin', include(admin.site.urls)),
    url(r'^docs/?', include(docgen_urls)),
    url(r'', include(main_urls)),
    url(r'', include(node_urls)),

]

if settings.ENV == "LOCAL":
    urlpatterns += [
        static(settings.STATIC_URL, document_root="/home/joel/space-race/gameserver/client/")[0],
        url(r'^(?P<file_name>.*)$', serve_html)
    ]

