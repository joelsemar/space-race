from django.db import models
from services.models import BaseModel
from uuid import uuid4



from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Game(BaseModel):

    name = models.CharField(max_length=128)
    num_players = models.PositiveIntegerField(default=2)
    start_time = models.DateTimeField(null=True, default=None)
    end_time = models.DateTimeField(null=True, default=None)
    node = models.ForeignKey("nodes.GameNode", null=True, blank=True)
    ready = models.BooleanField(default=True)

    @property
    def players(self):
        return Player.objects.filter(game=self)

    @property
    def players_ready(self):
        return all([p.ready for p in self.players])


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
    game = models.ForeignKey(Game)
    token = models.CharField(max_length=128, default=uuid4)
    nickname = models.CharField(max_length=32)
    user = models.ForeignKey(User, null=True)
    ready = models.BooleanField(default=False)
    creator = models.BooleanField(default=False)

    @property
    def dict(self):
        return {
            "nickname": self.nickname,
            "ready": self.ready
        }

from signals import *
