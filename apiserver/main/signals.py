import logging
from django.db.models.signals import post_save
from django.dispatch import receiver


from nodes.models import GameNode
from main.models import Player

logger = logging.getLogger("default")



def assign_to_node(game):
    node = GameNode.objects.filter(active=True, available=True).first()
    if not node:
        logger.debug("no available nodes!")
        return
    game.node = node
    node.available = False
    node.save()
    game.save()
