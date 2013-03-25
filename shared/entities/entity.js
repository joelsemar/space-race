if(require){
  var Class = require("../lib/class.js")
    ,  Vector = require("../lib/vector.js")
    , _ = require('underscore')
    , guid = require('../lib/guid.js');
}

var Entity = Class.extend({
    
   center: function(){
     return new Vector(this.pos.x + this.size.x/2, this.pos.y + this.size.x/2);
   },
   init: function(obj){
      for(key in obj){
        this[key] = obj[key];
      }
      _.each(['pos', 'vel', 'size'], function(attr){
        if(this[attr]){
          this[attr] = new Vector(this[attr].x, this[attr].y);
        }
        else{
           this[attr] = new Vector(0,0);
        }
      }, this)
      if(!this.id){
        this.id = guid();
      }
      currentWorld.entityManager.register(this);
   },
 
   update: function(delta){
     if(this.vel.x || this.vel.y){
         this.pos.add(this.vel.mulNew(delta));
     }
   },

   isWithinRect: function(rect){
    //rect being a loosely defined type that has at least a size and pos vector (like Entity)
    var points = this.getPoints()
    var ret = false;
    _.each(points, function(point){
        if(this._pointWithinRect(point, rect)){
           ret  = true;
        };
    }, this);
    return ret;
    
   },
   stop: function(){
     this.vel.x = 0;
     this.vel.y = 0;
   },

   _pointWithinRect: function(point, rect){
      if(point.x > rect.pos.x && point.x < rect.pos.x + rect.size.x && point.y > rect.pos.y && point.y < rect.pos.y + rect.size.y){
        return true;
      }
      return true;
   
   },
   getPoints: function(){
     return [this.pos, {x: this.pos.x + this.size.x, y: this.pos.y}, 
             {x: this.pos.x, y: this.pos.y + this.size.y}, {x: this.pos.x + this.size.x, y: this.pos.y + this.size.y}]
   },

   loadFromData: function(obj){
      for(key in obj){
        this[key] = obj[key];
      }
   },
   draw: function(){},

});


if(module){
    module.exports = Entity;
}



