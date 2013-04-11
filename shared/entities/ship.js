
if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore');
}

var Ship = Entity.extend({
   type: 'ship',
   speed: 80,
   collidesWith: ['island'],

//   speed: 10,
   resources: 0,
   target: null,
   size: {x: 41, y: 77},
   init: function(obj){
      this._super(obj);
      if(!this.target){
         return;
      }
      this.vel.x = this.target.center().x - this.center().x;
      this.vel.y = this.target.center().y - this.center().y;

      this.setVelocity(this.vel);
      this.pos.add(this.vel.mulNew(1));
      console.log("ship " + this.id + " created");
   },

   collideWithIsland: function(island){
     if(island.id !== this.target.id){
      return;
     }
     console.log("colliding with: " + island.id);
     if(island.player_id === this.player_id){
       island.resources += this.resources;
       this.destroy();
       return;
     }
     island.resources -= this.resources;
     if(island.resources < 0){
       island.resources = Math.abs(island.resources);
       island.player_id = this.player_id;
     }
     this.destroy();

   },


   draw: function() {
    var viewport = Game.viewport;
    var ctx = viewport.ctx;
    var offset = Game.viewport.getOffset(this.pos);
    var x = offset.x;
    var y = offset.y;
    var center = this.center();
    ctx.save();
    ctx.strokeStyle = 'white';
    //ctx.strokeStyle = Game.entityManager.entityById(this.player_id).color;
    ctx.font = '12px';
    ctx.lineWidth = 1;
    ctx.translate(x + this.size.x/2, y + this.size.y/2);
    ctx.rotate(Math.PI - this.vel.angle());
    ctx.translate(-this.size.x/2, -this.size.y/2);
    ctx.drawImage(Game.world.shipImage, 0, 0, this.size.x, this.size.y);
    ctx.rotate(-1 * (Math.PI - this.vel.angle()));
    ctx.strokeText(this.resources, 0, 0);
    ctx.restore();

   },


});


if(module){
 module.exports = Ship;
}
