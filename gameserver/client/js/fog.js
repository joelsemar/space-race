var Fog = UIElement.extend({
    canvasId: "fogCanvas",
    revealed: [new Vector(100, 100)],

    init: function(entityManager, viewport) {
        this._super()
        return;
        this.entityManager = entityManager;
        this.viewPortCtx = viewport.ctx;
        var ctx = this.ctx;
        // black out the canvas
        var overlay = 'rgba( 0, 0, 0, 1 )';
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, this.size.x, this.size.y);

    },

    onInit: function() {
        var game = getGame();
        this.pos = game.viewport.pos;
        this.size = game.viewport.size;
        this.constructCanvas();
    },

    draw: function() {
        //    _.each(this.revealed, this.revealAt, this);

    },

    revealAt: function(pos) {;
        var r1 = 100,
            r2 = 300;
        var ctx = this.viewPortCtx;
        var density = .4;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        var radGrd = ctx.createRadialGradient(pos.x, pos.y, r1, pos.x, pos.y, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(density, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx.fillStyle = radGrd;
        ctx.fillRect(pos.x - r2, pos.y - r2, r2 * 2, r2 * 2);
        ctx.restore();
    }


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

**/
