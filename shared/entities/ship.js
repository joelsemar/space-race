
if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore')
    , utils = require('../lib/utils.js');
}

var Ship = Entity.extend({
   type: 'ship',
   speed: 80,

   resources: 0,
   target: null,
   size: {x: 41, y: 77},
   collidesWith: ['ship' ],
   init: function(obj){
      this._super(obj);
      if(!this.targetID){
         return;
      }
      this.target = Game.entityManager.entityById(this.targetID);

      this.vel.x = this.target.center().x - this.center().x;
      this.vel.y = this.target.center().y - this.center().y;

      this.setVelocity(this.vel);
      if(!Game.client){
         this.pos.add(this.vel.mulNew(1));
      }
      console.log("ship " + this.id + " created");
   },
   update: function(){
      if (utils.rectsIntersect(this, this.target)){
        this.collideWithIsland(this.target);
      }
      if(this.resources <= 0){
        this.destroy();
      }

   },

   collideWithShip: function(ship){
     var thisTempResources = this.resources;
     if(this.id === ship.id){
       return;
     }
     if(this.player_id === ship.player_id){
       if(this.target.id === ship.target.id){
         ship.resources += this.resources;
         this.resources = 0;
         return;
       }
       else{
         return;
       }
     }
     else{
       this.resources -= ship.resources;
       if(this.resources < 0){
         this.resources = 0;
       }
       ship.resources -= thisTempResources;
       if(ship.resources < 0){
         ship.resources = 0;
       }
     }
     
   },

   collideWithIsland: function(island){
     if(island.id !== this.target.id){
      return;
     }
     console.log("colliding with: " + island.id);
     if(island.player_id === this.player_id){
       island.resources += this.resources;
     }
     else{
        island.resources -= this.resources;
        if(island.resources < 0){
           island.resources = Math.abs(island.resources);
           island.player_id = this.player_id;
           island.lastProductionTick = 0;
        }
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
