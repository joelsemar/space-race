/*jslint node: true */
"use strict";

var Class = require("../shared/lib/class.js"),
    Island = require('../shared/entities/island.js'),
    Ship = require('../shared/entities/ship.js'),
    EntityManager = require('../shared/entities/entitymanager.js'),
    Vector = require('../shared/lib/vector.js'),
    _ = require('underscore');

var World = Class.extend({

    numIslands: 50,

    init: function(players, size) {
        this.players = players;
        this.size = size;
        this.initializeIslands();
        this.assignStartingIslands();
    },

    playerSummary: function() {
        var ret = [];
        _.each(this.players, function(player) {
            ret.push({
                id: player.id,
                color: player.color,
                resourcesGathered: player.resourcesGathered,
                nickname: player.nickname
            });
        })
        return ret;
    },

    islandSummary: function() {
        var ret = [];
        _.each(this.islands, function(island) {
            ret.push({
                id: island.id,
                playerId: island.playerId,
                resources: island.resources,
                lastProductionTick: island.lastProductionTick,
                pos: island.pos,
                radius: island.radius,
                size: island.size
            });
        });
        return ret;
    },

    shipSummary: function(entityManager) {
        var ships = entityManager.entitiesByType('ship');
        var ret = [];
        _.each(ships, function(ship) {
            ret.push({
                id: ship.id,
                targetID: ship.targetID,
                playerId: ship.playerId,
                pos: ship.pos,
                vel: ship.vel,
                resources: ship.resources
            });
        });
        return ret;
    },

    getIslandData: function() {
        return generateIslands(this.size, this.numIslands, 500);
    },

    initializeIslands: function() {
        this.islands = [];
        var islandData = this.getIslandData();
        _.each(islandData, function(data) {
            data.pos = {
                x: data.x,
                y: data.y
            };
            data.size = {
                x: data.radius * 2,
                y: data.radius * 2
            };
            data.resources = data.radius;
            this.islands.push(new Island(data));
        }, this);

    },

    assignStartingIslands: function() {
        _.each(this.players, function(player, idx) {
            var i = idx,
                island;
            while (true) {
                island = this.islands[i];
                if (island.radius >= 50 && island.playerId == 'neutral') {
                    island.playerId = player.id;
                    break;
                } else {
                    i++;
                }
            }
        }, this);
    },
});


var islandRadii = [30, 30, 30, 30, 30, 35, 35, 35, 45, 45, 45, 45, 50, 50, 50, 55, 55, 60, 80];

function generateIslands(worldSize, numIslands, minDistance) {
    var radius, placed, foundCollision, diameter;
    var islands = [];
    var candidateLocation;
    for (var i = 0; i < numIslands; i++) {
        placed = false;
        radius = randomChoice(islandRadii);
        diameter = radius * 2;

        while (!placed) {
            foundCollision = false;
            candidateLocation = {
                x: randomChoice(_.range(20, worldSize.x - diameter)),
                y: randomChoice(_.range(20, worldSize.y - diameter))
            };
            for (var j = 0; j < islands.length; j++) {
                var island = islands[j];
                var distance = getCenter(island, island.radius).distanceTo(getCenter(candidateLocation, radius));
                if (distance < minDistance - island.radius - radius) {
                    foundCollision = true;
                    break;
                };
            };
            if (!foundCollision) {
                placed = true;
                islands.push({
                    x: candidateLocation.x,
                    y: candidateLocation.y,
                    radius: radius,
                    playerId: 'neutral'
                });
            }
        }
    }
    return islands;
}

function randomChoice(sequence) {
    return sequence[Math.floor(Math.random() * sequence.length)];
}

function getCenter(pos, radius) {
    return new Vector(pos.x + radius, pos.y + radius);

}

module.exports = World;
