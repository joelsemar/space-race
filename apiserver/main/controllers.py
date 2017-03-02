from services.controller import BaseController
from services.views import QuerySetView
from services.decorators import render_with, body, entity
from main.models import Game, Player
from views import GameView, PlayerView
from services.utils import str_to_bool


class AnonymousController(BaseController):

    def auth_check(self, request, method):
        token = request.session.get("player_token")
        if token:
            try:
                request.player = Player.objects.get(token=token, expired=False)
            except Player.DoesNotExist:
                request.player = None
        return None


class PlayerDto(object):
    nickname = "nickname"


class PlayerController(AnonymousController):
    view = PlayerView

    @body(PlayerDto, arg="player")
    def create(self, request, response, player):
        """
        "log in" by providing a nickname
        """
        player = Player.objects.create(nickname=player.nickname)
        request.session["player_token"] = str(player.token)
        response.set(instance=player)

    def read(self, request, response, token=None):
        """
        Fetch the current player object for the user
        Optionally pass ?token=<token> to resolve a player token
        API Handler: GET /player
        """
        if token:
            player = Player.objects.filter(token=token).first()
        else:
            player = request.player

        if not player:
            return response.not_found()

        response.set(instance=player)


class GameListController(AnonymousController):

    @render_with(QuerySetView(model_view=GameView))
    def read(self, request, response):
        """
        Fetch a list of open games
        API Handler: GET /games
        """
        response.set(queryset=Game.objects.filter(end_time=None))


class GameDto(object):
    name = "name"
    num_players = 2


class GameController(AnonymousController):
    view = GameView

    @body(GameDto, arg="game")
    def create(self, request, response, game_dto):
        """
        Create a new game
        API Handler: POST /game
        """
        game = Game.objects.create(num_players=game_dto.num_players, name=game_dto.name)
        request.player.join_game(game, creator=True)
        response.set(instance=game)

    def read(self, request, response):
        """
        Get current game, if any
        API Handler: GET /game
        """
        if not request.player.game:
            return response.not_found()

        response.set(instance=request.player.game)

    def update(self, request, response):
        """
        Update the game state, only usable by the creator of the game.
        API Handler: PUT /game
        """
        game = request.player.game
        if not game or not request.player.creator:
            return response.not_found()

        if not game.players_ready:
            return response.bad_request("All players must be ready before beginning")

        game.ready = True
        game.save()


class GamePlayerController(AnonymousController):
    view = PlayerView

    @entity(Game, arg="game")
    def create(self, request, response, game):
        """
        Join a game
        API Handler: POST /game/<game>/player
        """
        if game.num_players <= game.players.count():
            return response.bad_request("Game is full")

        if game.players.filter(nickname=request.player.nickname):
            return response.bad_request("A player by that name is already in this game.")

        request.player.join_game(game)
        response.set(instance=request.player)

    @entity(Game, arg="game")
    @render_with(GameView)
    def update(self, request, response, game):
        """
        Update ready status in the lobby
        API Handler: PUT /game/<game>/player/
        """
        if game.state != "lobby":
            return response.bad_request("Game has already started")

        if request.player.game_id != game.id:
            return response.not_found()

        request.player.ready = request.player.ready is False
        request.player.save()
        response.set(instance=game)

    @entity(Game, arg="game")
    def delete(self, request, response, game):
        """
        Leave a game
        API Handler: DELETE /game/<game>/player
        """
        if game.state != "lobby":
            return response.bad_request("Game has already started")

        if request.player.game_id != game.id:
            return response.not_found()

        if request.player.creator:
            game.players.update(game=None)
            game.delete()
        else:
            request.player.game = None
            request.player.save()
