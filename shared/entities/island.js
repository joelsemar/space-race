if(require){
  var Entity = require("./entity.js")
    , _ = require('underscore');
}

var Island = Entity.extend({ 
  
  type: 'island', 
  resources: 0,
  productionInterval: 2000,
  lastProductionTick: 0,
  update: function(delta){
    this.lastProductionTick += delta;
    if(this.lastProductionTick >= this.productionInterval){
      this.resources += Math.floor(this.radius/10);
      this.lastProductionTick = 0;
    }
  },

  draw: function(){
    var ctx = currentWorld.ctx;
    var viewport = currentWorld.viewport;
    var x = this.pos.x - viewport.pos.x;
    var y = this.pos.y - viewport.pos.y;
    var center = this.center();
    ctx.save();
    ctx.drawImage(currentWorld.islandImage, x, y, this.size.x, this.size.y);
    ctx.fillText(this.resources, center.x - viewport.pos.x, center.y - viewport.pos.y);
    ctx.restore();

  },


});

if(module){
   module.exports = Island;
}



