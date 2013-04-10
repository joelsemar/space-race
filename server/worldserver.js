var Class = require("../shared/lib/class.js")
  , Island = require('../shared/entities/island.js')
  , Ship = require('../shared/entities/ship.js')
  , BaseWorld = require('../shared/lib/baseworld.js')
  , Vector = require('../shared/lib/vector.js')
  , _ = require('underscore');

var World = BaseWorld.extend({

   fps: 12,   
   run: function(){
       this.initializeIslands();
       this.assignStartingIslands();
       this._super();
   },

   step: function(){
       this._super();
       this.updateWorld();
   },

   updateWorld: function(){
      updateWorld({size: this.size, islands: this.islands, ships: this.ships, players: this.players});
   },

   getIslandData: function(){
    return generateIslands(this.size, 50, 300);
   },

   initializeIslands: function(){
      this.islands = [];
      var islandData = this.getIslandData();
      console.log(islandData);
      _.each(islandData, function(data){
        data.pos = {x: data.x, y: data.y};
        data.size = {x: data.radius*2, y: data.radius*2};
        data.resources = data.radius;
        this.islands.push(new Island(data));
      }, this);

   },

   assignStartingIslands: function(){
      _.each(this.players, function(player, idx){
           this.islands[idx].player_id = player.id;
     }, this);
   },
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

var islandRadii = [30, 30, 30, 30, 30, 35, 35, 35,  45, 45, 45, 45, 50, 50, 50, 55, 55, 60, 80];

function generateIslands(worldSize, numIslands, minDistance){
   var radius, placed, foundCollision, diameter;
   var islands = [];
   var candidateLocation;
   for(var i=0;i<numIslands;i++){
     placed = false;
     radius = randomChoice(islandRadii);
     diameter = radius * 2;


     while(!placed){
        foundCollision = false;
        candidateLocation = {x: randomChoice(_.range(10, worldSize.x - diameter)), y:  randomChoice(_.range(10, worldSize.y - diameter))};
        for(var j=0;j<islands.length;j++){
            var island = islands[j];
            var distance = getCenter(island, island.radius).distanceTo(getCenter(candidateLocation, radius));
            if(distance < minDistance - island.radius - radius){
                foundCollision = true;
                break;
            };
        };
        if(!foundCollision){
            placed = true;
            islands.push({x: candidateLocation.x, y: candidateLocation.y, radius: radius});
        }


     }
    
      
   }
   return islands;
}
function randomChoice(sequence){
    return  sequence[Math.floor(Math.random() * sequence.length)];
}
function getCenter(pos, radius){
    return new Vector(pos.x + radius, pos.y + radius);
    
}
module.exports = World;
