from django.db import models
from services.models import BaseModel
from uuid import uuid4


from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    nickname = models.CharField(max_length=32, default='', blank=True)


class Game(BaseModel):

    name = models.CharField(max_length=128)
    num_players = models.PositiveIntegerField(default=2)
    start_time = models.DateTimeField(null=True, default=None, blank=True)
    end_time = models.DateTimeField(null=True, default=None, blank=True)
    node = models.ForeignKey("nodes.GameNode", null=True, blank=True)
    num_bots = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(default=3500)
    density = models.PositiveIntegerField(default=5)
    creator = models.ForeignKey("Player", related_name="created_game")
    ready = models.BooleanField(default=False)

    @property
    def players(self):
        return Player.objects.filter(game=self)

    @property
    def players_ready(self):
        return self.players.count() == self.num_players and all([p.ready for p in self.players])

    @property
    def state(self):
        if self.start_time is None:
            if self.node is None:
                return 'lobby'
            return 'connecting'

        elif self.end_time is None:
            return 'running'

        return 'done'


class Player(BaseModel):
    game = models.ForeignKey(Game, null=True, blank=True)
    token = models.CharField(max_length=128, default=uuid4)
    nickname = models.CharField(max_length=32)
    user = models.ForeignKey(User, null=True, blank=True)
    ready = models.BooleanField(default=False)
    expired = models.BooleanField(default=False)

    @property
    def dict(self):
        return {
            "nickname": self.nickname,
            "ready": self.ready,
            "id": self.id
        }

    def join_game(self, game):
        self.game = game
        self.ready = False
        self.save()

    @property
    def creator(self):
        if self.game:
            return self.game.creator == self
        return False

    def reset(self, nickname=None):
        self.expired = True
        self.save()
        new_nickname = nickname or self.nickname
        return Player.objects.create(nickname=new_nickname)

from signals import *
