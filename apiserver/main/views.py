from services.views import ModelView, QuerySetView
from main.models import Player
from nodes.models import ChatNode

# Create your views here.


class GameView(ModelView):

    def render(self, request):
        ret = super(GameView, self).render(request)
        ret["players"] = QuerySetView.inline_render(self.instance.players, request)
        ret["state"] = self.instance.state
        if self.instance.node:
            ret["node"] = self.instance.node.destination
        return ret


class PlayerView(ModelView):

    def render(self, request):
        ret = super(PlayerView, self).render(request)
        if request.player and request.player.id == self.instance.id:
            ret["token"] = self.instance.token

        try:
            ret["chatnode"] = ChatNode.objects.get(active=True).destination
        except ChatNode.DoesNotExist:
            pass

        if self.instance.game:
            ret["game"] = GameView.render_instance(self.instance.game, request)
            if self.instance.game.creator == self.instance:
                ret["creator"] = True

        return ret
