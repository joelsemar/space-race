var cls = require("../shared/lib/class.js")
  , Island = require('../shared/entities/island.js');
  , Ship = require('../shared/entities/ship.js');
  , _ = require('underscore');


var myWorld = new World();

var World = cls.Class.extend({

   fps: 30,   
   init: function(id, players){
       this.id = id;
       this.players = players;
       this.islands = this.initalizeIslands();
       this.ships = [];
       this.assignStartingIslands();
       
   },

   run: function(){
       this.lastFrame = new Date();
       this.intervalId = setInterval(this.step.bind(this), 1000/this.fps)
   },

   step: function(){
     _.each(this.islands, function(island){
       island.update();
    });

     _.each(this.ships, function(ship){
       ship.update();
    });
     
   },


   initializeIslands: function(){
      var islandData = this.getIslandData();
      _.each(islandData, function(data){
        this.islands.push(new Island(data));
      });

   },

   getIslandData(): function(){
    return [{ x: 145, y: 122, id: 1, radius: 30 },
            { x: 50, y: 50, radius: 32, id: 6},
            { x: 175, y: 200, id: 2, radius: 35 },
            { x: 260, y: 320, id: 8, radius: 28 },
            { x:280, y: 120, id: 7, radius: 54 },  
            { x: 130, y: 450, id: 3, radius: 54},
            { x: 100, y: 320, id: 4, radius: 41 },
            { x: 321, y: 404, id: 5, radius: 45 }];
   },

   assignStartingIslands: function(){
      _.each(this.players, function(player, id){
           player.id = id;
           this.islands[id].player = player;
     });
   },

});

var EntityManager = cls.Class.extend({

   init: function(){
     this.entities = {};
   },
   entityById: function(id){
     return this.entities[id];
   },
   addEntity: function(entity){
      this.entities[entity.id] = entity;
   },
   removeEntity: function(id){
      delete this.entities[id];
   }

});
module.exports = World;
