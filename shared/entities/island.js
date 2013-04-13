if(require){
  var Entity = require("./entity.js")
      Ship = require("./ship.js")
    , _ = require('underscore');
}

var Island = Entity.extend({

  type: 'island',
  resources: 0,
  maxResources: 50,
  productionInterval: 2000,
  lastProductionTick: 0,
  update: function(delta){
    this.lastProductionTick += delta;
    if(this.lastProductionTick >= this.productionInterval && this.player_id !== 'neutral'){
      this.resources += Math.floor(this.radius/10);
      if(this.resources > this.maxResources){
        this.resources = this.maxResources;
      }
      this.lastProductionTick = 0;
    }
  },

  draw: function(){
    var viewport = Game.viewport;
    var ctx = viewport.ctx;
    var offset = Game.viewport.getOffset(this.pos);
    var x = offset.x;
    var y = offset.y;
    var center = this.center();
    var text = this.resources;
    var color = 'white';
    ctx.save();
    ctx.drawImage(Game.world.islandImage, x, y, this.size.x, this.size.y);
    ctx.font = '18px Helvetica';
    if (this.player_id !== 'neutral'){
       color = Game.entityManager.entityById(this.player_id).color;
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if(this.selected){
     ctx.beginPath();
     ctx.arc(center.x - viewport.pos.x, center.y - viewport.pos.y, this.radius+2, 0, Math.PI * 2, true);
     ctx.stroke();
     ctx.closePath();
    }
    ctx.strokeText(this.resources, center.x - viewport.pos.x - ctx.measureText(text).width/2, center.y - viewport.pos.y + 9);
    ctx.restore();

  },
  attack: function(target){
     if(!this.resources || this.id === target.id){
         return;
     }
     var shipSize =  Math.floor(this.resources/2);
     this.resources -= shipSize;

     if(!Game.client){
         s = new Ship({targetID: target.id, pos: this.pos, resources: shipSize,
                       player_id: this.player_id, homeIslandId: this.id});
     }

  },

});

if(module){
   module.exports = Island;
}



