if(require){
  var Class = require("../lib/class.js")
    ,  Vector = require("../lib/vector.js")
    , _ = require('underscore')
    , utils = require('../lib/utils.js');
}
var Rect = Class.extend({
   size: new Vector(0,0),
   pos: new Vector(0,0),
   points: function(){
     return [this.pos,
             {x: this.pos.x + this.size.x, y: this.pos.y}, 
             {x: this.pos.x, y: this.pos.y + this.size.y}, 
             {x: this.pos.x + this.size.x, y: this.pos.y + this.size.y}]
   },
});

var Entity = Rect.extend({
   
   speed: 1,

   setVelocity: function(vel){
     this.vel = vel;
     this.vel.normalize().mul(this.speed);
   },

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
        this.id = utils.guid();
      }
      if(this.vel){
        this.setVelocity(this.vel);
      }
      Game.entityManager.register(this);
   },
 
   _update: function(delta){
     if(this.vel.x || this.vel.y){
         this.pos.add(this.vel.mulNew(delta/1000));
     }
     this.update(delta);
   },
   update: function() {},

   _rect: function(){
     //the fact that i even need this is a wart...oh well
     return {
        x: this.pos.x,
        y: this.pos.y,
        size: this.size
     }
   },

   stop: function(){
     this.vel.x = 0;
     this.vel.y = 0;
   },


   isWithinRect: function(rect){
    //rect being a loosely defined type that has at least a size and pos vector (like Entity)
    var points = this.getPoints()
    var ret = false;
    _.each(points, function(point){
        if(utils.pointWithinRect(point, rect)){
           ret  = true;
        };
    }, this);
    return ret;
    
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



