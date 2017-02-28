from datetime import datetime
from services.controller import BaseController
from services.view import BaseView, ModelView
from services.decorators import entity, body, unauthenticated
from services.utils import str_to_bool

from nodes.models import GameNode
from main.models import Game
from main.views import GameView
from views import NodeGameView

from django.conf import settings


class BaseGameNodeController(BaseController):

    def auth_check(self, request, method):
        token = request.META.get("HTTP_X_NODE_TOKEN")
        auth_response = BaseView(request).access_denied().serialize()

        if hasattr(method, "_unauthenticated"):
            return

        if not token:
            return auth_response
        try:
            request.node = GameNode.objects.get(token=token)
        except GameNode.DoesNotExist:
            return auth_response


class GameNodeDto(object):
    host = "127.0.0.1"
    port = "8001"
    available = "bool"
    action = "start|stop"


class GameNodeController(BaseGameNodeController):

    def read(self, request, response):
        """
        Get node info (including current game)
        API Handler: GET /node

        """
        try:
            game = Game.objects.get(node=request.node)
        except Game.DoesNotExist:
            return response.not_found()

        response.set(current_game=NodeGameView.render_instance(game, request))

    @body(GameNodeDto)
    @unauthenticated
    def create(self, request, response, node):
        """
        Register a new node with a valid host
        API Handler: POST /node
        """
        if node.host not in settings.GAME_NODE_HOSTS:
            return response.forbidden()

        if GameNode.objects.filter(active=True, host=node.host, port=node.port).exists():
            return response.forbidden()

        response.set(**GameNode.objects.create(host=node.host, port=node.port, active=True, available=True).dict)

    @body(GameNodeDto, arg="info")
    def update(self, request, response, info):
        """
        Update node status
        API Handler: PUT /node
        """
        request.node.available = str_to_bool(info.available)
        request.node.save()
        if (info.start_time or info.end_time):
            try:
                game = Game.objects.get(node=request.node)
            except Game.DoesNotExist:
                pass
            if info.action == 'start' and game.start_time is None:
                game.start_time = datetime.utcnow()
            if info.action == 'stop' and game.end_time is None:
                game.end_time = datetime.utcnow()
            game.save()
