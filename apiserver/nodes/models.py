from __future__ import unicode_literals

from django.db import models
from services.models import BaseModel
from uuid import uuid4

# Create your models here.


class GameNode(BaseModel):
    host = models.CharField(max_length=64)
    port = models.CharField(max_length=5)
    available = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    token = models.CharField(default=uuid4, max_length=128)

    @property
    def destination(self):
        return "http://%s:%s" % (self.host, self.port)
