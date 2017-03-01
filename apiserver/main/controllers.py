from services.controller import BaseController
from services.views import QuerySetView
from services.decorators import render_with, body, entity
from main.models import Game, Player
from views import GameView
from services.utils import str_to_bool


class AnonymousController(BaseController):

    def auth_check(self, request, method):
        return None

    def join_game(self, game, nickname, current_token=None, creator=False):
        if current_token:
            Player.objects.filter(token=current_token).delete()
        return Player.objects.create(nickname=nickname, game=game, creator=creator)


class GameListController(AnonymousController):

    @render_with(QuerySetView(model_view=GameView))
    def read(self, request, response):
        """
        Fetch a list of open games
        API Handler: GET /games
        """
        response.set(queryset=Game.objects.filter(start_time=None))


class GameDto(object):
    name = "name"
    num_players = 2
    nickname = "nickname"


class GameJoinDto(object):
    nickname = "nickname"


class GameController(AnonymousController):
    view = GameView

    @body(GameDto, arg="game")
    def create(self, request, response, game_dto):
        """
        Create a new game
        API Handler: POST /game
        """
        game = Game.objects.create(num_players=game_dto.num_players, name=game_dto.name)
        player = self.join_game(game, game_dto.nickname, request.session.get("player_token"), creator=True)
        request.session["player_token"] = str(player.token)
        response.set(instance=game)

    def read(self, request, response):
        """
        Get current game, if any
        API Handler: GET /game
        """
        player_token = request.session.get("player_token")
        try:
            player = Player.objects.get(token=player_token)
        except Player.DoesNotExist:
            return response.not_found()

        response.set(instance=player.game)

    def update(self, request, response):
        """
        Update the game state, only usable by the creator of the game.
        API Handler: POST /game
        """
        player_token = request.session.get("player_token")
        try:
            player = Player.objects.get(token=player_token, creator=True)
        except Player.DoesNotExist:
            return response.not_found()

        game = player.game
        if not game.players_ready:
            return response.bad_request("All players must be ready before beginning")

        game.ready = True
        game.save()


class PlayerController(AnonymousController):

    def read(self, request, response, token=None):
        """
        Fetch the current player object for the user
        API Handler: GET /player
        """
        if not token:
            token = request.session.get("player_token")
        try:
            player = Player.objects.get(token=token)
        except Player.DoesNotExist:
            return response.not_found()

        response.set(token=player.token, nickname=player.nickname, creator=player.creator)

    @entity(Game, arg="game")
    @body(GameJoinDto, arg="join")
    def create(self, request, response, join, game):
        """
        Join a game
        API Handler: POST /game/<game>/player
        """
        if game.num_players <= game.players.count():
            return response.bad_request("Game is full")

        if game.players.filter(nickname=join.nickname):
            return response.bad_request("A player by that name is already in this game.")

        player = self.join_game(game, join.nickname, request.session.get("player_token"))
        request.session["player_token"] = str(player.token)
        response.set(**player.dict)

    @entity(Game, arg="game")
    @render_with(GameView)
    def update(self, request, response, game):
        """
        Update ready status in the lobby
        API Handler: PUT /game/<game>/player/
        """
        if game.state != "lobby":
            return response.bad_request("Game has already started")

        player_token = request.session.get("player_token")
        try:
            player = Player.objects.get(token=player_token, game=game)
        except Player.DoesNotExist:
            return response.not_found()

        player.ready = player.ready is False
        player.save()
        response.set(instance=game)

    @entity(Game, arg="game")
    def delete(self, request, response, game):
        """
        Leave a game
        API Handler: DELETE /game/<game>/player
        """
        if game.state != "lobby":
            return response.bad_request("Game has already started")

        player_token = request.session.get("player_token")
        Player.objects.filter(token=player_token, game=game).delete()
