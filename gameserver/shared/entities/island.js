if (require) {
    var Entity = require("./entity.js"),
        Ship = require("./ship.js"),
        utils = require("../lib/utils.js"),
        _ = require('underscore');
}
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var islandImages = ["barren", "barren-charred", "barren-icy", "chlorine", "chlorine-barren",
    "desert", "inferno", "methane", "methane-barren", "methane-ice", "tundra"
]
var sprImages = ["spr_planet01", "spr_planet02", "spr_planet03", "spr_planet04", "spr_planet05", "spr_planet06", "spr_planet07"]
var pImages = ["p1shaded", 'p2shaded', "p3shaded", "p4shaded", "p5shaded", "p6shaded", "p7shaded", "p8shaded", "p9shaded", "p10shaded"]

var Island = Entity.extend({

    type: 'island',
    imageSrcTemplate: _.template("img/{{name}}.png"),
    resources: 0,
    maxResources: 500,
    productionInterval: 2000,
    timeSinceLastResource: 0,
    possibleUpgrades: ["growth", "attack", "defense"],
    productionMultiplier: 1,
    growthProductionMultiplier: 1,
    upgrade: null,
    vision: 5,

    init: function (obj) {
        this.imageSrc = this.imageSrcTemplate({
            name: utils.random(pImages)
        });
        this._super(obj);

    },

    update: function (delta) {
        this.timeSinceLastResource += delta;
        if (this.shouldProduceResources()) {
            this.produceResources();
        }
    },

    produceResources: function () {
        //players still get credit for resources gathered over max, just not ships
        var newResources = Math.floor(this.radius / 20) * this.productionMultiplier;
        this.getPlayer().resourcesGathered += newResources;
        this.addResources(newResources);
        this.timeSinceLastResource = 0;
    },

    addUpgrade: function (upgradeName) {
        if (upgradeName == "growth") {
            this.productionMultiplier = this.growthProductionMultiplier;
        }
    },

    addResources: function (resources) {
        if (this.resources >= this.maxResources) {
            return;
        }
        if ((this.maxResources - this.resources) < resources) {
            this.resources = this.maxResources;

        }
        this.resources += resources;

    },

    shouldProduceResources: function () {
        if (this.playerId === "neutral") {
            return false;
        }
        if (this.timeSinceLastResource < this.productionInterval) {
            return false;
        }
        return true;
    },

    draw: function (ctx, offsetPos) {
        var x = offsetPos.x;
        var y = offsetPos.y;
        var center = this.center(offsetPos);
        var text = this.resources;
        var color = 'white';
        ctx.save();
        ctx.drawImage(this.image, x, y, this.size.x, this.size.y);
        ctx.font = '26px Helvetica';

        if (this.playerId !== 'neutral') {
            color = this.getPlayer().color;
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        if (this.selected) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(center.x, center.y, this.radius + 2, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.lineWidth = 1;
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        ctx.fillText(text, center.x - ctx.measureText(text).width / 2, center.y + 9);
        ctx.restore();

    },


    getPlayer: function () {
        return getGame().entityManager.entityById(this.playerId);
    },

    attack: function (target) {
        if (!this.resources || this.id === target.id) {
            return;
        }
        var shipSize = Math.floor(this.resources / 2);
        this.resources -= shipSize;

        // if the ship object is creatd on the client there
        // seems to always be a jitter as the server updates
        if (!RUNNING_ON_CLIENT) {
            s = new Ship({
                targetID: target.id,
                pos: this.pos,
                resources: shipSize,
                playerId: this.playerId,
                homeIslandId: this.id
            });
        }

    },

});


if (module) {
    module.exports = Island;
}
