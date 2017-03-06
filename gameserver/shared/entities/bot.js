var Player = require('./player.js'),
    _ = require("underscore");
var Bot = Player.extend({
    attackInterval: 5000,
    timeSinceLastAttack: 0,
    checkNearest: 4,

    update: function(delta) {
        this.timeSinceLastAttack += delta;
        if (!this.shouldAttack()) {
            return;
        }

        var myIslands = this.getIslands();
        var allIslands = getGame().entityManager.entitiesByType("island");

        _.each(myIslands, (island) => {
            var nearestN = this.nearest(island, allIslands, this.checkNearest);
            for (var i = 0; i < nearestN.length; i++) {
                var target = nearestN[i];
                if (target.resources < island.resources / 2) {
                    island.attack(target)
                    this.timeSinceLastAttack = 0;
                    break;
                }
            }
        });

    },

    shouldAttack: function() {
        return this.timeSinceLastAttack > this.attackInterval;
    },


    nearestIsland: function(island, otherIslands) {
        var currentNearest;
        var currentNearestDistance = 10000000;
        for (var i = 0; i < otherIslands.length; i++) {
            var target = otherIslands[i];
            if (target.playerId === this.id) {
                continue;
            }
            var distance = island.pos.distanceTo(target.pos);
            if (distance < currentNearestDistance) {
                currentNearestDistance = distance;
                currentNearest = target;
            }
        }
        return currentNearest;
    },

    nearest: function(island, otherIslands, num) {
        var ret = [];

        cmp = (a, b) => {
            return (island.pos.distanceTo(a.pos)) - (island.pos.distanceTo(b.pos))
        }

        for (var i = 0; i < otherIslands.length; i++) {
            var target = otherIslands[i];
            if (target.playerId === this.id) {
                continue;
            }
            if (ret.length < num) {
                ret.push(target);
                continue;
            }
            var distance = island.pos.distanceTo(target)
            if (island.pos.distanceTo(ret[ret.length - 1].pos) > distance) {
                ret[ret.length - 1] = target;
                ret.sort(cmp);
            }
        }
        return ret;

    },

});
if (module) {
    module.exports = Bot;
}
