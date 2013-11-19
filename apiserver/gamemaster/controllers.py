

from services.controllers import BaseController
from services.views import QuerySetView
from services.decorators import login_required
from gamemaster.models import Game, Player



class GamesController(BaseController):


  
    @render_with(QuerySetView)
    def read(self, request, response):
        games = Game.objects.all()
        response.queryset = games


    @login_required
    def create(self, request, response):
        
        
