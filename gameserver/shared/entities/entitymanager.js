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

   entitiesByIds: function(ids){
     var ret = [];
     _.each(ids, function(id){
       ret.push(this.entityById(id));
     }, this);
     return ret;
   },

   register: function(entity){
      this.entities[entity.id] = entity;
   },

   removeEntity: function(id){
      console.log("Destroying " + id);
      delete this.entities[id];
   },

   updateEntities: function(delta){
     for (id in this.entities){
         this.entities[id]._update(delta);
     }
   },

   drawEntities: function(){
     var entity;
     for (id in this.entities){
       entity = this.entities[id];
       if(utils.rectsIntersect(Game.viewport, entity) || entity.type === 'UIElement' || entity.type === 'player'){
          entity.draw();
          if(Game.debug){
            entity.drawDebug();
          }
       }
     }
   },

   entitiesByType: function(type, filterFunc){
     var ret = [];
     filterFunc = filterFunc || function(){return true};
     for (id in this.entities){
        var entity = this.entities[id];
        if(entity.type === type && filterFunc(entity)){
          ret.push(entity);
        }
     }
     return ret;
   },

});

if(module){
  module.exports = EntityManager;
}
