import logging
import requests
import json
from django.db.models.signals import post_save, post_delete
from django.conf import settings
from django.dispatch import receiver
from services.utils import DateTimeAwareJSONEncoder


from nodes.models import GameNode, ChatNode, update_inactive_nodes
from main.models import Player, Game

logger = logging.getLogger("default")


@receiver(post_save, sender=Player)
def handle_player_update(sender, instance=None, created=False, **kwargs):
    update_lobby()


@receiver(post_save, sender=Game)
def handle_game_update(sender, instance=None, created=False, **kwargs):
    if instance.ready and not instance.end_time and not instance.node:
        assign_to_node(instance)

    update_lobby()


@receiver(post_delete, sender=Game)
def handle_game_delete(sender, instance=None, created=False, **kwargs):
    update_lobby()


def assign_to_node(game):
    logger.debug("Assigning node to game: %s " % game.dict)
    update_inactive_nodes()
    node = GameNode.objects.filter(active=True, available=True).first()
    if not node:
        logger.debug("no available nodes!")
        return

    logger.debug("Found node: ")
    game.node = node
    node.available = False
    payload = game.dict
    payload['players'] = [{'id': p.id, 'nickname': p.nickname, 'token': p.token}
                          for p in Player.objects.filter(game=game)]
    payload['node'] = node.destination

    resp = send_to_node(node, "/game", payload)
    logger.debug(resp.content)
    if resp.status_code == 200:
        node.save()
        game.save()
    else:
        logger.debug(resp.content)


def update_lobby():
    logger.debug("Updating lobby")
    update_inactive_nodes()
    nodes = ChatNode.objects.filter(active=True, available=True)
    if not nodes.count():
        logger.debug("No available chat nodes!")
        return

    games = Game.objects.filter(end_time=None)
    ret = []
    for game in games:
        payload = game.dict
        payload["location"] = settings.GAME_LOCATION
        if game.node:
            payload['node'] = game.node.destination
        payload['players'] = [{'id': p.id, 'nickname': p.nickname, 'ready': p.ready}
                              for p in Player.objects.filter(game=game)]
        ret.append(payload)

    for node in nodes:
        resp = send_to_node(node, "/lobby", ret)
        logger.debug(resp)
        logger.debug(resp.content)


def send_to_node(node, path, data):
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(data, cls=DateTimeAwareJSONEncoder)
    return requests.put(node.destination + path, data, headers=headers)
