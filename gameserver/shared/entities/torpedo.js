if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore')
    , utils = require('../lib/utils.js');
}

var Torpedo = Entity.extend({
   type: 'torpedo',
   speed: 210,

   target: null,
   size: {x: 41, y: 77},
   collidesWith: ['ship', 'island'],
   onInit: function(){
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
}