if (require) {
    var Entity = require('./entity.js'),
        utils = require('../lib/utils.js'),
        _ = require("underscore");

}


var Player = Entity.extend({
    type: 'player',
    doubleClickDelay: 300,
    pendingDoubleClick: false,
    selectStart: false,
    resourcesGathered: 0,

    draw: function(ctx) {
        if (this.selectStart && this.selectEnd) {
            console.log('drawing select box')
            var sizeX = this.selectEnd.x - this.selectStart.x;
            var sizeY = this.selectEnd.y - this.selectStart.y;
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.rect(this.selectStart.x, this.selectStart.y, sizeX, sizeY);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    },

    click: function(x, y) {
        var game = getGame();
        this.selectStart = new Vector(x, y);
        this.isSelecting = true;
        var x = x + game.viewport.pos.x;
        var y = y + game.viewport.pos.y;
        var point = new Vector(x, y);
        var islands = game.entityManager.entitiesByType('island');

        var islandClicked = false;
        _.each(islands, function(island) {
            if (utils.pointInRect(point, island)) {
                islandClicked = island;
            }
        }, this);

        if (!islandClicked) {
            this.clearSelection()
            this.pendingDoubleClick = false;
            return;
        }

        if (this.pendingDoubleClick && this.pendingDoubleClick === islandClicked) {
            this.selectVisible();
            this.pendingDoubleClick = false;
            return;
        } else if (this.selectedIslands().length) {
            this.attack(islandClicked);
        } else {
            this.select(islandClicked);
            this.pendingDoubleClick = islandClicked;
            setTimeout(() => {
                this.pendingDoubleClick = false;
            }, this.doubleClickDelay);


        }
        this.selectStart = 0;

    },

    select: function(target) {
        if (target.playerId === this.id) {
            target.selected = true;
        }
        if (this.hasOwnProperty("onSelect")){
            this.onSelect();
        }
    },

    unSelect: function(target) {
        target.selected = false;
    },

    clearSelection: function() {
        _.each(getGame().entityManager.entitiesByType('island'), function(island) {
            island.selected = false;
        });
    },

    getIslands: function() {
        return getGame().entityManager.entitiesWhere({
            playerId: this.id,
            type: 'island'
        })
    },

    selectedIslands: function() {
        return getGame().entityManager.entitiesWhere({
            type: 'island',
            selected: true,
            playerId: this.id
        });
    },

    attack: function(target) {
        getGame().sendAttackSignal(target);
        _.each(this.selectedIslands(), (island) => {
            island.attack(target);
        });
        this.clearSelection();
        if (this.hasOwnProperty("onAttack")){
            this.onAttack();
        }
    },


    updateSelect: function(x, y) {
        this.selectEnd = new Vector(x, y)
    },


    selectVisible: function() {
        var viewport = getGame().viewport;
        _.each(getGame().entityManager.entitiesByType('island'), (island) => {
            if (island.playerId === this.id && utils.rectsIntersect(island, viewport)) {
                this.select(island);
            }
        });
    },

    stopSelect: function() {
        if (this.selectEnd && this.selectEnd.distanceTo(this.selectStart) > 10) {
            this.selectIslands();
        }
        this.selectStart = 0;
        this.selectEnd = 0;
        this.isSelecting = false;

    },

    selectedIslandIds: function() {
        return _.pluck(this.selectedIslands(), 'id');
    },

    selectIslands: function() {
        var game = getGame()
        var allIslands = game.entityManager.entitiesWhere({
            type: 'island',
            playerId: this.id
        });
        var selectPos = {
            x: game.viewport.pos.x + this.selectStart.x,
            y: game.viewport.pos.y + this.selectStart.y
        };
        var selectSize = {
            x: this.selectEnd.x - this.selectStart.x,
            y: this.selectEnd.y - this.selectStart.y
        };

        var selectionRect = new Rect(selectPos, selectSize);
        _.each(allIslands, function(island) {
            if (utils.rectsIntersect(selectionRect, island)) {
                this.select(island);
            } else {
                this.unSelect(island);
            }
        }, this);


    },

    deathCheck: function() {
        var assets = getGame().entityManager.entitiesWhere({
            playerId: this.id
        })
        // a bit of a hack, this prevents false positives when the game is getting set up
        return this.resourcesGathered > 0 && assets.length <= 0;
    }

});
if (module) {
    module.exports = Player;
}
