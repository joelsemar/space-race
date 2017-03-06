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
    running: false,
    players: [],
    size: {
        x: 5000,
        y: 5000
    },

    run: function() {

        this.lastFrame = new Date();
        this.intervalId = setInterval(this.step.bind(this), 1000 / this.fps)
        this.running = true;
    },

    resetFrame: function() {
        this.stop();
        this.run();
    },

    step: function() {
        if (!this.running) {
            return;
        }
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

    log: function(msg) {
        if (this.id) {
            console.log("Game-" + this.id + ": " + msg);
        } else {
            console.log("Game: " + msg);
        }
    },

});



if (module) {
    module.exports = BaseGame;
}
