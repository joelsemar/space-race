if (require) {
    var Entity = require("./entity.js"),
        _ = require('underscore'),
        utils = require('../lib/utils.js');
}

var Ship = Entity.extend({
    type: 'ship',
    speed: 110,
    imageSrc: 'static/img/ship.png',
    vision: 1,

    resources: 0,
    target: null,
    size: {
        x: 41,
        y: 77
    },
    collidesWith: ['ship', 'island'],
    onInit: function () {
        if (!this.targetID) {
            return;
        }
        this.target = getGame().entityManager.entityById(this.targetID);

        this.vel.x = this.target.center().x - this.center().x;
        this.vel.y = this.target.center().y - this.center().y;

        this.setVelocity(this.vel);
        if (!RUNNING_ON_CLIENT) {
            this.pos.add(this.vel.mulNew(1));
        }
    },

    update: function () {
        if (this.resources <= 0) {
            this.destroy();
        }

    },

    collideWithShip: function (ship) {
        var thisTempResources = this.resources;
        if (this.id === ship.id) {
            return;
        }
        if (this.playerId === ship.playerId) {
            if (this.targetID === ship.targetID) {
                ship.resources += this.resources;
                this.resources = 0;
                return;
            } else {
                return;
            }
        } else {
            this.resources -= ship.resources;
            if (this.resources < 0) {
                this.resources = 0;
            }
            ship.resources -= thisTempResources;
            if (ship.resources < 0) {
                ship.resources = 0;
            }
        }

    },

    collideWithIsland: function (island) {
        if (island.id !== this.target.id) {
            return;
        }
        if (island.playerId === this.playerId) {
            island.resources += this.resources;
        } else {
            island.resources -= this.resources;
            if (island.resources < 0) {
                island.resources = Math.abs(island.resources);
                island.playerId = this.playerId;
                island.lastProductionTick = 0;
            }
        }
        var game = getGame();
        this.destroy();
        if (this.playerId == game.currentPlayerId && game.getCurrentPlayer().hasOwnProperty("onShipLand")) {
            game.getCurrentPlayer().onShipLand();
        }

    },


    draw: function (ctx, offsetPos) {
        var center = this.center();
        var halfWidth = Math.floor(this.size.x/2);
        var halfHeight = Math.floor(this.size.y/2);
        ctx.save();
        ctx.font = '12px';
        ctx.lineWidth = 1;
        ctx.translate(x + halfWidth, y + halfHeight);
        ctx.rotate(Math.PI - this.vel.angle());
        ctx.translate(-1 * halfWidth, -1 * halfHeight);
        ctx.drawImage(this.image, 0, 0, this.size.x, this.size.y);
        ctx.beginPath();
        ctx.lineWidth = 1;
        if (this.playerId !== 'neutral') {
            ctx.strokeStyle = getGame().entityManager.entityById(this.playerId).color;
        }
        ctx.arc(halfWidth,  halfHeight, halfWidth + 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.rotate(-1 * (Math.PI - this.vel.angle()));
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.strokeText(this.resources, 0, 0);
        ctx.restore();
    }

});


if (module) {
    module.exports = Ship;
}
