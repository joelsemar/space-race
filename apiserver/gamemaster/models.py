from django.db import models
from services.models import BaseModel
from django.contrib.auth.models import User
from datetime import datetime
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import models as auth_models



# Create your models here.


class Account(AbstractUser):

    pass

auth_models.User = Accunt




class CurrencyType(BaseModel):
    name = models.CharField(max_length=32)


class BountyType(BaseModel):
    
    amount = models.DecimalField()
    currency = models.ForeignKey(CurrencyType)

class Game(BaseModel):
    
    num_players = models.PositiveIntegerField(default=2)
    bounty = models.ForeignKey(BountyType)
    start_time = models.DateTimeField(null=True, default=None)
    end_time = models.DateTimeField(null=True, default=None)

    @property
    def state(self):
        if self.start_time == None:
            return 'lobby'

        elif self.end_time == None:
            return 'running'

        else:
            return 'done'

class Player(BaseModoel):
    game = models.ForeignKey(Game)
    account = models.ForeignKey(Account)


    
