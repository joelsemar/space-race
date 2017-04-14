if (require) {
    var Class = require("../lib/class.js"),
        utils = require('../lib/utils.js'),
        _ = require('underscore');
}

var EntityManager = Class.extend({
    seenMap: {},
    visibleSectorMap: {},

    init: function () {
        this.entities = {};
    },

    entityById: function (id) {
        return this.entities[id];
    },

    entitiesByIds: function (ids) {
        var ret = [];
        _.each(ids, (id) => {
            var entity = this.entityById(id);
            if (entity) {
                ret.push(entity);
            }
        });
        return ret;
    },

    register: function (entity) {
        this.entities[entity.id] = entity;
    },

    removeEntity: function (id) {
        delete this.entities[id];
    },

    updateEntities: function (delta) {
        var game = getGame();
        game.clearVisible();
        for (var id in this.entities) {
            var entity = this.entities[id];
            if (!entity) {
                continue;
            }
            entity._update(delta);
            if (entity.playerId && entity.playerId != "neutral") {
                for (var sector of entity.computeVisibleSectors()) {
                    game.markSeen(entity.playerId, sector);
                    game.markVisible(entity.playerId, sector);
                }

            }
            _.each(entity.collidesWith, (entityType) => {
                var entities = this.entitiesByType(entityType);
                _.each(entities, (target) => {
                    if (entity.id === target.id) {
                        return;
                    }
                    if (utils.rectsIntersect(entity, target)) {
                        var methodName = 'collideWith' + utils.capitalize(target.type);
                        entity[methodName](target);
                    }

                });

            });
        }
    },

    drawEntities: function () {
        var entity;
        var game = getGame();
        for (var id in this.entities) {
            entity = this.entities[id];
            if (utils.rectsIntersect(game.viewport, entity) || entity.type === 'UIElement' || entity.type === 'player') {
                entity.draw(game.viewport.ctx, game.viewport.getOffset(entity.pos));
                if (game.debug) {
                    entity.drawDebug();
                }
            }
        }
    },

    entitiesByType: function (type, filterFunc) {
        var ret = [];
        filterFunc = filterFunc || function () {
            return true
        };
        for (var id in this.entities) {
            var entity = this.entities[id];
            if (entity.type === type && filterFunc(entity)) {
                ret.push(entity);
            }
        }
        return ret;
    },

    entitiesWhere: function (where) {
        return _.where(this.entities, where);
    }

});

if (module) {
    module.exports = EntityManager;
}
