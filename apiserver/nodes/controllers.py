from datetime import datetime
from services.controller import BaseController
from services.view import BaseView
from services.decorators import body, unauthenticated
from services.utils import str_to_bool

from nodes.models import GameNode, ChatNode
from main.models import Game
from views import NodeGameView

from django.conf import settings


class NodeDto(object):
    host = "127.0.0.1"
    available = "bool"
    node_tag = "nodeTag"
    action = "start|stop"


class BaseNodeController(BaseController):
    def node_class(self):
        raise Exception("return a node class dummy")

    def auth_check(self, request, method):
        NodeClass = self.node_class()
        token = request.META.get("HTTP_X_NODE_TOKEN")
        auth_response = BaseView(request).access_denied().serialize()

        if hasattr(method, "_unauthenticated"):
            return

        if not token:
            return auth_response
        try:
            request.node = NodeClass.objects.get(token=token, active=True)
        except NodeClass.DoesNotExist:
            return auth_response

    @body(NodeDto, arg="node")
    @unauthenticated
    def create(self, request, response, node):
        """
        Register a new node with a valid host
        API Handler: POST /node
        """
        NodeClass = self.node_class()
        if node.host not in settings.NODE_HOSTS:
            return response.forbidden()

        response.set(**NodeClass.objects.create(host=node.host, active=True, available=True, node_tag=node.node_tag).dict)

    @body(NodeDto, arg="info")
    def update(self, request, response, info):
        """
        Update node status
        API Handler: PUT /node
        """
        if hasattr(info, 'available'):
            request.node.available = str_to_bool(info.available)
            request.node.save()

        response.set(**request.node.dict)


class ChatNodeController(BaseNodeController):

    def node_class(self):
        return ChatNode

    def read(self, request, response):
        """
        Get current chat node info
        API Handler: GET /chatnode

        """

        response.set(**request.node.dict)


class GameNodeController(BaseNodeController):
    view = NodeGameView

    def node_class(self):
        return GameNode

    def read(self, request, response):
        """
        Get node info (including current game)
        API Handler: GET /node
        """
        try:
            game = Game.objects.get(node=request.node, end_time=None)
        except Game.DoesNotExist:
            game = Game.objects.filter(ready=True, node=None, end_time=None).order_by("created_date").first()
            if not game:
                return response.not_found()

            game.node = request.node
            game.save()
            request.node.available = False
            request.node.save()

        response.set(instance=game)

    @body(NodeDto, arg="info")
    def update(self, request, response, info):
        """
        Update node status
        API Handler: PUT /node
        """
        super(GameNodeController, self).update(request, response, info)

        if info.action:
            try:
                game = Game.objects.get(node=request.node, end_time=None)
            except Game.DoesNotExist:
                return

            if info.action == 'start' and game.start_time is None:
                game.start_time = datetime.utcnow()
            if info.action == 'stop' and game.end_time is None:
                game.end_time = datetime.utcnow()
                game.players.update(game=None)
            game.save()
