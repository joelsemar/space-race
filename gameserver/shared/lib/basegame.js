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
    seenMap: {},
    visibleSectorMap: {},
    sectorSize: 150,
    size: {
        x: 5000,
        y: 5000
    },

    run: function () {

        this.lastFrame = new Date();
        this.intervalId = setInterval(this.step.bind(this), 1000 / this.fps)
        this.running = true;
    },

    resetFrame: function () {
        this.stop();
        this.run();
    },

    step: function () {
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

    stop: function () {
        clearInterval(this.intervalId);
        this.running = false;
    },


    log: function (msg) {
        if (this.id) {
            console.log("Game-" + this.id + ": " + msg);
        } else {
            console.log("Game: " + msg);
        }
    },

    markSeen: function (playerId, sector) {
        if (!this.seenMap[playerId]) {
            this.seenMap[playerId] = {};
        }
        this.seenMap[playerId][sector] = true;

    },

    clearVisible: function () {

        this.visibleSectorMap = {};
        for (var player of this.players) {
            this.visibleSectorMap[player.id] = {};
        }
    },

    markVisible: function (playerId, sector) {
        if (!this.visibleSectorMap[playerId]) {
            this.visibleSectorMap[playerId] = {};
        }
        this.visibleSectorMap[playerId][sector] = true;
    }


});



if (module) {
    module.exports = BaseGame;
}
