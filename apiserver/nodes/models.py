from __future__ import unicode_literals

from django.db import models
from datetime import datetime, timedelta
from services.models import BaseModel
from uuid import uuid4

NODE_EXPIRY = 30 * 1000


class BaseNode(BaseModel):
    host = models.CharField(max_length=64)
    port = models.CharField(max_length=5)
    available = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    token = models.CharField(default=uuid4, max_length=128)

    class Meta:
        abstract = True

    @property
    def destination(self):
        return "http://%s:%s" % (self.host, self.port)

    def save(self, *args, **kwargs):
        if not self.port:
            self.port = self.find_open_port()
        super(BaseNode, self).save(*args, **kwargs)

    def find_open_port(self):
        update_inactive_nodes()
        existing = self.__class__.objects.filter(active=True).order_by('port').values_list('port', flat=True)

        if not existing:
            return self.port_range[0]

        for port in self.port_range:
            if str(port) not in existing:
                return port


def update_inactive_nodes():
    now = datetime.utcnow()
    cutoff = now - timedelta(milliseconds=NODE_EXPIRY)
    GameNode.objects.filter(last_modified__lte=cutoff).update(active=False)
    ChatNode.objects.filter(last_modified__lte=cutoff).update(active=False)


class GameNode(BaseNode):
    port_range = range(8001, 9000)

    class Meta:
        abstract = False


class ChatNode(BaseNode):
    port_range = range(7001, 8000)

    class Meta:
        abstract = False
