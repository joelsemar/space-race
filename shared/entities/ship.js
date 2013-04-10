
if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore');
}

var Ship = Entity.extend({ 
   type: 'ship',
   speed: 80,
   troops: 0,
   target: null,
   size: {x: 41, y: 77},
   init: function(obj){
      this._super(obj);
      if(!this.target){
         return;
      }
//      this.pos.x -= this.size.x/2;
//      this.pos.y -= this.size.y/2;
      this.vel.x = this.target.center().x - this.center().x;
      this.vel.y = this.target.center().y - this.center().y;
      this.setVelocity(this.vel);
   },
   

   draw: function() {
    var viewport = Game.viewport;
    var ctx = viewport.ctx;
    var x = this.pos.x - viewport.pos.x;
    var y = this.pos.y - viewport.pos.y;
    var center = this.center();
    ctx.save();
    ctx.translate(x + this.size.x/2, y + this.size.y/2);
    ctx.rotate(Math.PI - this.vel.angle());
    ctx.translate(-this.size.x/2, -this.size.y/2);
    ctx.drawImage(Game.world.shipImage, 0, 0, this.size.x, this.size.y);
    ctx.restore();
   },

   
});


if(module){
 module.exports = Ship;
}       
