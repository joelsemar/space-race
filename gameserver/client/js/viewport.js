/*jslint node: true */
"use strict";
var ViewPort = Entity.extend({
    type: 'viewport',
    speed: 800,

    pos: new Vector(0, 0),
    vel: new Vector(0, 0),
    scrollHitBoxWidth: 100,
    lastDebug: 0,
    size: new Vector(0, 0),
    cachedIslands: [],

    update: function() {
        this.checkBounds();
    },


    init: function(obj) {
        this._super(obj);
        this.size = new Vector($(document).width(), $(document).height());
        var canvas = document.getElementById('mainCanvas');
        canvas.setAttribute('width', this.size.x);
        canvas.setAttribute('height', this.size.y);
        canvas.style.width = this.size.x + "px";
        canvas.style.height = this.size.y + "px";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.style.bottom = "0px";
        canvas.style.right = "0px";
        canvas.style.zIndex = "10";
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    },

    update: function(delta) {
        var spaceX = this.pos.x / 30 * -1;
        var spaceY = this.pos.y / 30 * -1;
        if (Math.abs(spaceX) > this.size.x) {
            spaceX = 0;
        }
        if (Math.abs(spaceY) > this.size.y) {
            spaceY = 0;
        }
        $(document.body).css({
            'background-position-x': spaceX,
            'background-position-y': spaceY
        });

    },

    clear: function() {
        this.ctx.clear();
    },

    getOffset: function(pos) {
        return new Vector(Math.round(pos.x - this.pos.x), Math.round(pos.y - this.pos.y))
    },


    drawDebug: function() {
        var ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.font = '12px';
        ctx.strokeText(this.pos.print(), 15, 15)
        if (this.currMousePos) {
            ctx.strokeText(this.currMousePos.print(), this.currMousePos.x - 5, this.currMousePos.y - 5)
            ctx.strokeStyle = 'yellow';
            ctx.strokeText(Math.round(this.pos.x + this.currMousePos.x) + ', ' + Math.round(this.pos.y + this.currMousePos.y), this.currMousePos.x + 15, this.currMousePos.y + 15)
        }
        ctx.restore();

    },

    checkBounds: function() {
        var game = getGame();
        if (this.pos.x <= 0) {
            this.pos.x = 0;
        }
        if (this.pos.x > game.size.x - this.size.x) {
            this.pos.x = game.size.x - this.size.x;
        }
        if (this.pos.y <= 0) {
            this.pos.y = 0;
        }
        if (this.pos.y > game.size.y - this.size.y) {
            this.pos.y = game.size.y - this.size.y;
        }
    },

    bindEvents: function() {
        var game = getGame();
        var currentPlayer = game.getCurrentPlayer();
        this.canvas.onmousedown = (e) => {
            var coords = utils.getCoords(e, this);
            currentPlayer.click(coords.x, coords.y);
        };

        this.canvas.onmousemove = (e) => {
            var coords = utils.getCoords(e, this);
            game.viewport.currMousePos = new Vector(coords.x, coords.y);
            if (!currentPlayer.isSelecting) {
                return;
            }
            currentPlayer.updateSelect(coords.x, coords.y);
        };

        this.canvas.onmouseup = function(e) {
            currentPlayer.stopSelect();
        };

        this.canvas.onmouseout = function() {
            currentPlayer.stopSelect();
        }

        $(document).mousemove((event) => {
            var mousePos = {
                x: event.pageX,
                y: event.pageY
            };

            this.vel.x = 0;
            this.vel.y = 0;
            if (currentPlayer.isSelecting || event.shiftKey) {
                return;
            }


            if (mousePos.x < this.scrollHitBoxWidth && this.pos.x > 0) {
                this.vel.add(new Vector(-1, 0));
            }
            if (mousePos.x > (this.size.x - this.scrollHitBoxWidth) && this.pos.x < (game.size.x - this.size.x)) {
                this.vel.add(new Vector(1, 0));
            }
            if (mousePos.y < this.scrollHitBoxWidth && this.pos.y > 0) {
                this.vel.add(new Vector(0, -1));
            }
            if (mousePos.y > (this.size.y - this.scrollHitBoxWidth) && this.pos.y < (game.size.y - this.size.y)) {
                this.vel.add(new Vector(0, 1));
            }
            this.setVelocity(this.vel);

        });
    },
});
