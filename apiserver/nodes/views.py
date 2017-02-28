from services.views import ModelView, QuerySetView
from main.models import Player

# a slightly different game view with player tokens for Node verification


class NodeGameView(ModelView):

    def render(self, request):
        ret = super(NodeGameView, self).render(request)
        players = Player.objects.filter(game=self.instance)
        ret["players"] = QuerySetView.inline_render(players, request, model_view=PlayerNodeGameView)
        return ret


class PlayerNodeGameView(ModelView):

    def render(self, request):
        ret = super(PlayerNodeGameView, self).render(request)
        ret["token"] = self.instance.token
        return ret
