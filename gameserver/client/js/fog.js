var BaseFog = UIElement.extend({
    active: true,
    clearFill: 'rgba( 0, 0, 0, 1 )',
    hideFill: 'rgba( 0, 0, 0, 1 )',

    init: function () {
        this._super();
        var game = getGame();
        this.entityManager = game.entityManager;
        this.viewport = game.viewport;
        this.pos = game.viewport.pos;
        this.size = game.viewport.size;
        this.canvas = this.constructCanvas();
    },

    getPoints: function () {
        //return  list of objects with .pos and .radius attributes

    },
    draw: function () {
        var ctx = this.ctx;
        this.ctx.clear();
        ctx.save();

        ctx.fillStyle = this.hideFill;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, this.size.x, this.size.y);

        ctx.fillStyle = this.clearFill;
        ctx.globalCompositeOperation = 'destination-out';

        _.each(this.getPoints(), (point) => {
            this.revealAt(point.pos, point.radius);
        });

        ctx.restore();
    },

    revealAt: function (pos, radius) {
        var ctx = this.ctx;
        ctx.fillStyle = this.clearFill;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
    },

})

var FullFog = BaseFog.extend({
    canvasId: "fullFogCanvas",
    zIndex: "2",



    getPoints: function () {
        var game = getGame();
        var playerId = game.currentPlayerId;
        var points = [];
        for (var sector in game.seenMap) {
            var pos = utils.sectorCenter(sector, game.sectorSize);
            var offset = this.viewport.getOffset(pos);
            points.push({
                pos: offset,
                radius: game.sectorSize / 1.4
            })
        }
        var entities = this.entityManager.entitiesWhere({
            "playerId": getGame().currentPlayerId
        })
        _.each(entities, (entity) => {
            var offset = this.viewport.getOffset(entity.pos);
            // tack on half a sector to the radius to account for center row of sectors in light box
            var lightRadius = entity.vision * game.sectorSize + game.sectorSize / 2
            points.push({
                pos: entity.center(offset),
                radius: lightRadius
            });
        });
        return points;

    },

})

var Fog = BaseFog.extend({
    zIndex: "1",
    canvasId: "fogCanvas",
    hideFill: 'rgba(0,0,0,0.7)',
    getPoints: function () {
        var results = [];
        var game = getGame()
        var entities = this.entityManager.entitiesWhere({
            "playerId": game.currentPlayerId
        })
        _.each(entities, (entity) => {
            var offset = this.viewport.getOffset(entity.pos);
            // tack on half a sector to the radius to account for center row of sectors in light box
            var lightRadius = entity.vision * game.sectorSize + game.sectorSize / 2
            results.push({
                pos: entity.center(offset),
                radius: lightRadius
            });
        });
        return results;

    },

})

var MiniMapFog = Fog.extend({
    canvasId: "miniMapFogCanvas",
    init: function () {
        this._super();
        var game = getGame();
        this.entityManager = game.entityManager;
        this.pos = game.miniMap.pos;
        this.size = game.miniMap.size;
        this.miniMap = game.miniMap;
        this.canvas = this.constructCanvas();
    },

    getPoints: function () {
        var results = [];
        var sectorSize = getGame().sectorSize;
        var entities = this.entityManager.entitiesWhere({
            "playerId": getGame().currentPlayerId
        })
        _.each(entities, (entity) => {
            // tack on half a sector to the radius to account for center row of sectors in light box
            var lightRadius = entity.vision * sectorSize + sectorSize / 2
            results.push({
                pos: this.miniMap.scale(entity.pos),
                radius: lightRadius * this.miniMap.xRatio
            });
        });
        return results;
    },

})
var MiniMapFullFog = FullFog.extend({
    canvasId: "miniMapFullFogCanvas",
    zIndex: '110',
    init: function () {
        this._super();
        var game = getGame();
        this.entityManager = game.entityManager;
        this.pos = game.miniMap.pos;
        this.size = game.miniMap.size;
        this.miniMap = game.miniMap;
        this.canvas = this.constructCanvas();
    },

    getPoints: function () {
        var game = getGame();
        var points = [];
        var sectorSize = game.sectorSize;
        for (var sector in game.seenMap) {
            var pos = utils.sectorCenter(sector, sectorSize);
            points.push({
                pos: this.miniMap.scale(pos),
                radius: (sectorSize / 1.4) * this.miniMap.xRatio
            })
        }
        var entities = this.entityManager.entitiesWhere({
            "playerId": getGame().currentPlayerId
        })
        _.each(entities, (entity) => {
            // tack on half a sector to the radius to account for center row of sectors in light box
            var lightRadius = entity.vision * sectorSize + sectorSize / 2
            points.push({
                pos: this.miniMap.scale(entity.pos),
                radius: lightRadius * this.miniMap.xRatio
            });
        });
        return points;

    },

})


// init canvas
/***
var canvas = $('canvas'),
    ctx = canvas[0].getContext('2d') // world
    ,
    ctx2 = canvas[1].getContext('2d') // fog
    ,
    ctx3 = canvas[2].getContext('2d') // chars
    ,
    mDown = false,
    r1 = 100,
    r2 = 300,
    density = .4,
    hideOnMove = true,
    hideFill = 'rgba( 0, 0, 0, .7 )',
    overlay = 'rgba( 0, 0, 0, 1 )';

if (!hideOnMove) {
    // shouldn't be done like this, but this is a demo
    canvas.get(1).remove();
}


// set up our "eraser"
ctx.globalCompositeOperation = 'destination-out';

canvas.last()
    .on('mousemove', function(ev, ev2) {
        ev2 && (ev = ev2);

        var pX = ev.pageX,
            pY = ev.pageY;

        // reveal wherever we drag
        var radGrd = ctx.createRadialGradient(pX, pY, r1, pX, pY, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(density, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx.fillStyle = radGrd;
        ctx.fillRect(pX - r2, pY - r2, r2 * 2, r2 * 2);

        // partially hide the entire map and re-reval where we are now
        ctx2.globalCompositeOperation = 'source-over';
        ctx2.clearRect(0, 0, 1280, 800);
        ctx2.fillStyle = hideFill;
        ctx2.fillRect(0, 0, 1280, 800);

        var radGrd = ctx.createRadialGradient(pX, pY, r1, pX, pY, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(.8, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx2.globalCompositeOperation = 'destination-out';
        ctx2.fillStyle = radGrd;
        ctx2.fillRect(pX - r2, pY - r2, r2 * 2, r2 * 2);

        // hide characters except where we can see.  Can this be done in ctx2?
        ctx3.clearRect(0, 0, 1280, 800);

        // draw "characters"
        ctx3.globalCompositeOperation = 'source-over';
        ctx3.fillStyle = '#F00';
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < 20; j++) {
                ctx3.fillRect(i * 100, j * 100, 10, 10);
            }
        }

        // hide characters except for in current location
        ctx3.globalCompositeOperation = 'destination-in';
        ctx3.fillStyle = radGrd;
        ctx3.fillRect(0, 0, 1280, 800);
    })
    .trigger('mousemove', {
        pageX: 150,
        pageY: 150
    });

    revealAt2: function(pos, r2) {
        var r1 = 100;
        var ctx = this.ctx;
        var density = .4;
        r2 *= 2;

        var radGrd = ctx.createRadialGradient(pos.x, pos.y, r1, pos.x, pos.y, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(density, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx.fillStyle = radGrd;
        ctx.fillRect(pos.x - r2, pos.y - r2, r2 * 2, r2 * 2);
    },
    revealAt2: function(pos, r2) {
        var r1 = 100;
        var ctx = this.ctx;

        var radGrd = ctx.createRadialGradient(pos.x, pos.y, r2 - 100, pos.x, pos.y, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(.8, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = radGrd;
        ctx.fillRect(pos.x - r2, pos.y - r2, r2 * 2, r2 * 2);
    },

**/
