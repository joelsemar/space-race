from services.views import ModelView, QuerySetView
from main.models import Player
from nodes.models import ChatNode

# Create your views here.


class GameView(ModelView):

    def render(self, request):
        ret = super(GameView, self).render(request)
        players = Player.objects.filter(game=self.instance)
        ret["players"] = QuerySetView.inline_render(players, request)
        ret["state"] = self.instance.state
        if self.instance.node:
            ret["node"] = self.instance.node.destination
        return ret


class PlayerView(ModelView):

    def render(self, request):
        ret = super(PlayerView, self).render(request)
        ret["token"] = self.instance.token
        ret["creator"] = self.instance.creator
        try:
            ret["chatnode"] = ChatNode.objects.get(active=True).destination
        except ChatNode.DoesNotExist:
            pass

        if self.instance.game and self.instance.game.node and not self.instance.game.end_time:
            ret["node"] = self.instance.game.node.destination
        return ret
