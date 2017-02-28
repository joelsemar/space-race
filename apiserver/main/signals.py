import logging
from django.db.models.signals import post_save
from django.dispatch import receiver


from nodes.models import GameNode
from main.models import Player

logger = logging.getLogger("default")


@receiver(post_save, sender=Player)
def handle_player_state_change(sender, instance=None, **kwargs):
    print "handling player update"
    if instance.ready and all(instance.game.players.values_list('ready', flat=True)):

        assign_to_node(instance.game)


def assign_to_node(game):
    node = GameNode.objects.filter(active=True, available=True).first()
    if not node:
        logger.debug("no available nodes!")
        return
    game.node = node
    node.available = False
    node.save()
    game.save()
