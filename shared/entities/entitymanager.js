if(require){
  var Class = require("../lib/class.js")
    , _ = require('underscore');
}

var EntityManager = Class.extend({

   init: function(){
     this.entities = {};
   },

   entityById: function(id){
     return this.entities[id];
   },

   register: function(entity){
      this.entities[entity.id] = entity;
   },

   removeEntity: function(id){
      delete this.entities[id];
   },

   updateEntities: function(delta){
     for (id in this.entities){
         this.entities[id].update(delta);
     }
   },

   drawEntities: function(){
     for (id in this.entities){
       this.entities[id].draw();
     }
   },
 
   getEntitiesByType: function(type){
     var ret = [];
     for (id in this.entities){
        var entity = this.entities[id];
        if(entity.type === type){
          ret.push(entity);
        }
     }
     return ret;
   },

});

if(module){
  module.exports = EntityManager;
}
