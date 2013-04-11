if(require){
  var Class = require("../lib/class.js")
    ,  Vector = require("../lib/vector.js")
    , _ = require('underscore')
    , utils = require('../lib/utils.js');
}
var Rect = Class.extend({
   size: new Vector(0,0),
   pos: new Vector(0,0),
   init: function(pos, size){
      this.pos = new Vector(pos.x, pos.y);
      this.size = new Vector(size.x, size.y);
   },
   points: function(){
     return [this.pos,
             {x: this.pos.x + this.size.x, y: this.pos.y},
             {x: this.pos.x, y: this.pos.y + this.size.y},
             {x: this.pos.x + this.size.x, y: this.pos.y + this.size.y}]
   },
   drawDebug: function(){
      var ctx = Game.viewport.ctx;
      var offset = Game.viewport.getOffset(this.pos);
      var x = offset.x;
      var y = offset.y;
      ctx.save();
      ctx.strokeStyle = 'white';
      ctx.font = '12px';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, this.size.x, this.size.y);
      ctx.strokeText(this.pos.print(), x, y - 12);
      ctx.strokeText(x + ', ' + y, x + 80, y - 12);
      ctx.strokeText(this.id, x, y  + this.size.y + 12);
      ctx.restore();
   },
   area: function(){
       return this.size.x * this.size.y;
   },
   left: function(){
       return this.pos.x;
   },
   top: function(){
       return this.pos.y;
   },
   right: function(){
       return this.pos.x + this.size.x;
   },
   bottom: function(){
       return this.pos.y + this.size.y;
   },
});

var Entity = Rect.extend({

   speed: 1,
   collidesWith: [],

   setVelocity: function(vel){
     this.vel = vel;
     this.vel.normalize().mul(this.speed);
   },

   center: function(){
     return new Vector(this.pos.x + this.size.x/2, this.pos.y + this.size.y/2);
   },

   init: function(obj){
      this.loadFromData(obj);
      Game.entityManager.register(this);
   },

   _update: function(delta){
     if(this.vel.x || this.vel.y){
         this.pos.add(this.vel.mulNew(delta/1000));
     }
     _.each
     if(this.collidesWith.length){
       var entities = Game.entityManager.entities;
       for (id in entities){
         var entity = entities[id];
         if(this.collidesWith.indexOf(entity.type) !== -1  && utils.rectsIntersect(this, entity)){
             var methodName = 'collideWith' + utils.capitalize(entity.type);
             this[methodName](entity);
         }
      }
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

   destroy: function(){
     Game.entityManager.removeEntity(this.id);
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
      _.each(['pos', 'vel', 'size'], function(attr){
        if(this[attr]){
          this[attr] = new Vector(this[attr].x, this[attr].y);
        }
        else{
           this[attr] = new Vector(0,0);
        }
      }, this)
      if(!this.id){
        this.id = utils.guid().slice(0,5);
      }
      if(this.vel){
        this.setVelocity(this.vel);
      }
   },
   draw: function(){},

});


if(module){
    module.exports = Entity;
}



