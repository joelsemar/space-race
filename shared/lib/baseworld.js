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
   size: {x: 5000, y: 5000},
   init: function(id, players){
       this.id = id;
       this.players = players;
       this.ships = [];
       this.entityManager = new EntityManager();
       
   },

   run: function(){
       this.initializeIslands();
       this.assignStartingIslands();
       this.lastFrame = new Date();
       this.intervalId = setInterval(this.step.bind(this), 1000/this.fps)
   },

   step: function(){
     var now = new Date();
     var delta = now - this.lastFrame;
     if (delta < 0){
        delta = 1
     }
     this.entityManager.updateEntities(delta);
     this.lastFrame = now;
     this.currentTick = delta;
     this.updateWorld();
     
   },

   updateWorld: function(){ },

   initializeIslands: function(){
      this.islands = [];
      var islandData = this.getIslandData();
      _.each(islandData, function(data){
        data.pos = {x: data.x, y: data.y};
        data.size = {x: data.radius*2, y: data.radius*2};
        this.islands.push(new Island(data));
      }, this);

   },

   getIslandData: function(){
      return [];
   },

   assignStartingIslands: function(){
      _.each(this.players, function(player, idx){
           this.islands[idx].player_id = player.id;
     }, this);
   },

});



if(module){
  module.exports = BaseWorld;
}



