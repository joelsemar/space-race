from services.controller import BaseController
from services.views import QuerySetView
from services.decorators import render_with, body, entity, unauthenticated, render_with
from services.utils import str_to_bool
from main.models import Game, Player
from views import GameView, PlayerView
from django.contrib.auth import logout


class AnonymousController(BaseController):

    def auth_check(self, request, method):
        token = request.session.get("player_token")
        request.player = None
        if token:
            try:
                request.player = Player.objects.get(token=token, expired=False)
            except Player.DoesNotExist:
                pass
        return None


class PlayerDto(object):
    nickname = "nickname"


class PlayerController(AnonymousController):
    view = PlayerView

    @body(PlayerDto, arg="player")
    def create(self, request, response, player):
        """
        "log in" by providing a nickname
        API Handler: POST /player
        """

        player = Player.objects.create(nickname=player.nickname)
        request.session["player_token"] = str(player.token)
        request.player = player
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

        if request.player and player.game and player.game.end_time:
            player = request.player.reset()
            request.session["player_token"] = str(player.token)

        response.set(instance=player)

    def delete(self, request, response):
        """
        Log out, (for anonymous session just clear the session)
        API Handler: DELETE /player
        """
        request.session.clear()


class PlayerResetDto(object):
    nickname = "new nickname"


class PlayerResetController(AnonymousController):
    view = PlayerView

    @body(PlayerResetDto, arg="reset")
    def create(self, request, response, reset=None):
        """
        "Reset" a player by creating a new one and giving it to the current session
        API Handler: POST /player/reset
        """
        if not request.player:
            return
        new_nickname = reset and reset.nickname or request.player.nickname
        player = request.player.reset(nickname=new_nickname)
        request.session["player_token"] = str(player.token)
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
    ready = 0
    num_bots = 2
    size = 3500
    density = 5


class GameController(AnonymousController):
    view = GameView

    @body(GameDto, arg="game")
    def create(self, request, response, game_dto):
        """
        Create a new game
        API Handler: POST /game
        """
        game = Game.objects.create(num_players=game_dto.num_players, num_bots=game_dto.num_bots,
                                   name=game_dto.name, creator=request.player)
        request.player.join_game(game)
        response.set(instance=game)

    def read(self, request, response):
        """
        Get current game, if any
        API Handler: GET /game
        """
        if not request.player.game:
            return response.not_found()

        if request.player.game.end_time:
            return response.not_found()

        response.set(instance=request.player.game)

    @body(GameDto, arg="game_dto")
    def update(self, request, response, game_dto):
        """
        Update the game state, only usable by the creator of the game.
        API Handler: PUT /game
        """
        game = request.player.game

        if not game or not game.creator == request.player:
            return response.not_found()

        if game.state != "lobby":
            return response.bad_request("Game has already started")

        dirty = False
        # if the "ready" value is sent, everything else is ignored
        if getattr(game_dto, "ready") and not game.ready:
            if not game.players_ready:
                return response.bad_request("All players must be ready before beginning")
            game.ready = str_to_bool(game_dto.ready)
        else:
            for field in ["num_players", "num_bots", "size", "density", "name"]:
                if hasattr(game_dto, field) and getattr(game_dto, field) != getattr(game, field):
                    dirty = True
                    setattr(game, field, getattr(game_dto, field))

        game.save()

        if dirty:
            Player.objects.filter(game=game).update(ready=False)

        response.set(instance=game)


class GamePlayerController(AnonymousController):
    view = GameView

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
        response.set(instance=game)

    @entity(Game, arg="game")
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
    @render_with(PlayerView)
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

        request.player.game = None
        request.player.save()

        response.set(instance=request.player)


class LogoutController(BaseController):

    @unauthenticated
    def read(self, request, response):
        """
        Logout
        API Handler: GET /logout
        """
        logout(request)
