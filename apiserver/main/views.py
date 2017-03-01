from services.views import ModelView, QuerySetView
from main.models import Player

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
