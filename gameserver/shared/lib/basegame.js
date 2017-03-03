/*jslint node: true */
"use strict";
if (require) {
    var Class = require("./class.js"),
        Island = require('../entities/island.js'),
        Ship = require('../entities/ship.js'),
        _ = require('underscore');
}

var BaseGame = Class.extend({
    fps: 12,
    lastFrame: new Date(),
    players: [],
    size: {
        x: 3500,
        y: 3500
    },


    run: function() {
        this.lastFrame = new Date();
        this.intervalId = setInterval(this.step.bind(this), 1000 / this.fps)
    },

    resetFrame: function() {
        this.stop();
        this.run();
    },

    step: function() {
        var now = new Date();
        var delta = now - this.lastFrame;
        if (delta < 0) {
            delta = 1
        }
        this.entityManager.updateEntities(delta);
        this.lastFrame = now;
        this.currentTick = delta;
    },

    stop: function() {
        clearInterval(this.intervalId);
    },


});



if (module) {
    module.exports = BaseGame;
}
