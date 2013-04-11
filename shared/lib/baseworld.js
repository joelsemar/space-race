if(require){
  var Class = require("./class.js")
    , Island = require('../entities/island.js')
    , Ship = require('../entities/ship.js')
    , EntityManager = require('../entities/entitymanager.js')
    , _ = require('underscore');
}

var BaseWorld = Class.extend({
   fps: 12,
   lastFrame: new Date(),
   players: [],
   size: {x: 5000, y: 5000},
   init: function(id, players){
       this.id = id;
       this.players = players;
       this.ships = [];

   },

   run: function(){
       this.lastFrame = new Date();
       this.intervalId = setInterval(this.step.bind(this), 1000/this.fps)
   },

   step: function(){
     var now = new Date();
     var delta = now - this.lastFrame;
     if (delta < 0){
        delta = 1
     }
     Game.entityManager.updateEntities(delta);
     this.lastFrame = now;
     this.currentTick = delta;
   },


});



if(module){
  module.exports = BaseWorld;
}



