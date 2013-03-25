var Class = require("../shared/lib/class.js")
  , Island = require('../shared/entities/island.js')
  , Ship = require('../shared/entities/ship.js')
  , BaseWorld = require('../shared/lib/baseworld.js')
  , _ = require('underscore');

var World = BaseWorld.extend({

   fps: 12,   
   updateWorld: function(){
      updateWorld({size: this.size, islands: this.islands, ships: this.ships});
   },
   getIslandData: function(){
    return [{ x: 145, y: 122, radius: 30 },
            { x: 150, y: 50, radius: 32, id: 6},
            { x: 175, y: 200, radius: 35 },
            { x: 1260, y: 1320, radius: 28 },
            { x: 1550, y: 3050, radius: 32, id: 6},
            { x: 175, y: 200, radius: 35 },
            { x: 1260, y: 1320, radius: 28 },
            { x:280, y: 1120, radius: 54 },  
            { x: 4730, y: 2450, radius: 54},
            { x: 4800, y: 4820, radius: 41 },
            { x:280, y: 1120, radius: 54 },  
            { x: 730, y: 1450, radius: 54},
            { x: 1200, y: 2320, radius: 41 },
            { x: 321, y: 404, radius: 45 }];
   }
});

var EntityManager = Class.extend({

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
