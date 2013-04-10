if(require){
  var Entity = require("./entity.js")
      Ship = require("./ship.js")
    , _ = require('underscore');
}

var Island = Entity.extend({ 
  
  type: 'island', 
  resources: 0,
  productionInterval: 2000,
  lastProductionTick: 0,
  update: function(delta){
    this.lastProductionTick += delta;
    if(this.lastProductionTick >= this.productionInterval && this.player_id){
      this.resources += Math.floor(this.radius/10);
      this.lastProductionTick = 0;
    }
  },

  draw: function(){
    var viewport = Game.viewport;
    var ctx = viewport.ctx;
    var x = this.pos.x - viewport.pos.x;
    var y = this.pos.y - viewport.pos.y;
    var center = this.center();
    var text = this.resources;
    var color = 'white';
    ctx.save();
    ctx.drawImage(Game.world.islandImage, x, y, this.size.x, this.size.y);
    ctx.font = 'italic 18px Helvetica';
    if (this.player_id){
       color =  Game.world.playerById(this.player_id).color;
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if(this.selected){
     ctx.beginPath();
     ctx.arc(center.x - viewport.pos.x, center.y - viewport.pos.y, this.radius+2, 0, Math.PI * 2, true);
     ctx.stroke();
     ctx.closePath();
    }
    ctx.shadowColor = 'gray';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    

    ctx.fillText(this.resources, center.x - viewport.pos.x - ctx.measureText(text).width/2, center.y - viewport.pos.y + 9);
    ctx.restore();

  },
  attack: function(target){
     if(!this.resources || this.id === target.id){
         return;
     }
     var shipSize =  Math.floor(this.resources/2);
     this.resources -= shipSize;
     
     s = new Ship({target: target, pos: this.center(), player_id: this.player_id});
     s.pos.x -= s.size.x/2;
     s.pos.y -= s.size.y/2;
     
  },

});

if(module){
   module.exports = Island;
}



