if (require) {
    var Class = require("../lib/class.js"),
        Vector = require("../lib/vector.js"),
        _ = require('underscore'),
        utils = require('../lib/utils.js');
}
var Rect = Class.extend({
    size: new Vector(0, 0),
    pos: new Vector(0, 0),

    init: function(pos, size) {
        this.pos = new Vector(pos.x, pos.y);
        this.size = new Vector(size.x, size.y);
        this.onInit();
    },

    points: function() {
        return [this.pos,
            {
                x: this.pos.x + this.size.x,
                y: this.pos.y
            },
            {
                x: this.pos.x,
                y: this.pos.y + this.size.y
            },
            {
                x: this.pos.x + this.size.x,
                y: this.pos.y + this.size.y
            }
        ]
    },
    drawDebug: function() {
        var ctx = Game.viewport.ctx;
        var offset = Game.viewport.getOffset(this.pos);
        var x = offset.x;
        var y = offset.y;
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.font = '12px';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.size.x, this.size.y);
        ctx.strokeText(this.pos.print(), x, y - 12);
        ctx.strokeText(x + ', ' + y, x + 80, y - 12);
        ctx.strokeText(this.id, x, y + this.size.y + 12);
        ctx.restore();
    },

    area: function() {
        return this.size.x * this.size.y;
    },
    left: function() {
        return this.pos.x;
    },
    top: function() {
        return this.pos.y;
    },
    right: function() {
        return this.pos.x + this.size.x;
    },
    bottom: function() {
        return this.pos.y + this.size.y;
    },
    onInit: function() {},
});

var Entity = Rect.extend({
    imageSrc: false,

    speed: 1,
    collidesWith: [],
    alive: true,

    setVelocity: function(vel) {
        this.vel = vel;
        this.vel.normalize().mul(this.speed);
    },

    center: function(offset) {
        var pos = offset || this.pos;
        return new Vector(pos.x + this.size.x / 2, pos.y + this.size.y / 2);
    },

    init: function(obj) {
        this.loadFromData(obj);
        this.register();
        if (RUNNING_ON_CLIENT && this.imageSrc) {
            this.buildImage();
        }
        this.onInit();
    },

    _update: function(delta) {
        if (!this.alive) {
            return;
        }
        if (this.vel.x || this.vel.y) {
            this.pos.add(this.vel.mulNew(delta / 1000));
        }

        this.update(delta);
    },

    update: function() {},

    _rect: function() {
        //the fact that i even need this is a wart...oh well
        return {
            x: this.pos.x,
            y: this.pos.y,
            size: this.size
        }
    },

    stop: function() {
        this.vel.x = 0;
        this.vel.y = 0;
    },

    destroy: function() {
        ///this.alive = false;
        getGame().entityManager.removeEntity(this.id);
    },

    register: function() {
        getGame().entityManager.register(this)
    },


    isWithinRect: function(rect) {
        var points = this.getPoints()
        var ret = false;
        _.each(points, function(point) {
            if (utils.pointWithinRect(point, rect)) {
                ret = true;
            };
        }, this);
        return ret;

    },

    loadFromData: function(obj) {
        for (key in obj) {
            this[key] = obj[key];
        }
        _.each(['pos', 'vel', 'size'], (attr) => {
            if (this[attr]) {
                this[attr] = new Vector(this[attr].x, this[attr].y);
            } else {
                this[attr] = new Vector(0, 0);
            }
        })

        if (!this.id) {
            this.id = utils.guid().slice(0, 5);
        }
        if (this.vel) {
            this.setVelocity(this.vel);
        }
    },

    draw: function() {},
    buildImage: function() {
        this.image = new Image();
        this.image.src = this.imageSrc;
    },

});


if (module) {
    module.exports = Entity;
}
