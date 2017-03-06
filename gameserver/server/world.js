/*jslint node: true */
"use strict";

var Class = require("../shared/lib/class.js"),
    Island = require('../shared/entities/island.js'),
    Ship = require('../shared/entities/ship.js'),
    EntityManager = require('../shared/entities/entitymanager.js'),
    Vector = require('../shared/lib/vector.js'),
    _ = require('underscore');

var World = Class.extend({

    numIslands: 75,

    init: function(size, entityManager, gameId) {
        this.size = size;
        this.entityManager = entityManager;
        this.initializeIslands(gameId);
        this.assignStartingIslands();
    },

    playerSummary: function() {
        var ret = [];
        var players = this.entityManager.entitiesByType('player');
        _.each(players, function(player) {
            ret.push({
                id: player.id,
                color: player.color,
                resourcesGathered: player.resourcesGathered,
                nickname: player.nickname,
                alive: player.alive
            });
        })
        return ret;
    },

    islandSummary: function() {
        var islands = this.entityManager.entitiesByType('island');
        var ret = [];
        _.each(islands, function(island) {
            ret.push({
                id: island.id,
                playerId: island.playerId,
                resources: island.resources,
                lastProductionTick: island.lastProductionTick,
                pos: island.pos,
                radius: island.radius,
                gameId: island.gameId,
                size: island.size
            });
        });
        return ret;
    },

    shipSummary: function(entityManager) {
        var ships = this.entityManager.entitiesByType('ship');
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

    initializeIslands: function(gameId) {
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
            data.gameId = gameId;
            data.resources = data.radius;
            new Island(data);
        }, this);

    },

    assignStartingIslands: function(players) {
        var islands = this.entityManager.entitiesByType("island");
        var players = this.entityManager.entitiesByType('player');
        _.each(players, function(player, idx) {
            var i = idx,
                island;
            while (true) {
                island = islands[i];
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


var islandRadii = [30, 30, 30, 30, 30, 35, 35, 35, 45, 45, 45, 45, 50, 50, 50, 55, 55, 60, 60, 60, 70, 70, 80];

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
