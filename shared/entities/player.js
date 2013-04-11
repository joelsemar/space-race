if (require){
  var Entity = require('./entity.js'),
      utils = require('../lib/utils.js');

}

var Player = Entity.extend({
    type: 'player',
    selectedIslands: [],
    selectStart: false,
    init: function(obj){
      this._super(obj);
      this.token = this.id;
    },
    draw: function(){
       var ctx = Game.viewport.ctx;
       if(this.selectStart && this.selectEnd){
         var sizeX = this.selectEnd.x - this.selectStart.x;
         var sizeY = this.selectEnd.y - this.selectStart.y;
         ctx.save();
         ctx.lineWidth = 1;
         ctx.strokeStyle = 'white';
         ctx.beginPath();
         ctx.rect(this.selectStart.x, this.selectStart.y, sizeX, sizeY);
         ctx.closePath();
         ctx.stroke();
         ctx.restore();
       }
    },

    click: function(x,y){
      this.selectStart = {x: x, y: y};
      this.isSelecting = true;
      var x = x + Game.viewport.pos.x;
      var y = y + Game.viewport.pos.y;
      var point = new Vector(x, y);
      var islands = Game.entityManager.getEntitiesByType('island');
      _.each(islands, function(island){
        island.selected = false;
        if (utils.pointInRect(point, island)){
           if(island.player_id === this.id){
             if(this.selectedIslands.length){
               this.attack(island);
               return;
             }
             else{
                this.selectedIslands.push(island);
                island.selected = true;
                return;
             }
           }
           else {
             this.attack(island);
             return;
           }
        }
      }, this);

    },

    clearSelection: function(){
        _.each(this.selectedIslands, function(island){
          island.selected = false;
       }, this);
       this.selectedIslands = [];
    },

    attack: function(target){
      Game.sendAttackSignal(target);
      _.each(this.selectedIslands, function(island){
        island.attack(target);
      },this);
      this.clearSelection();
    },


    updateSelect: function(x,y){
      this.selectEnd = {x: x, y: y};
    },

    stopSelect: function(){
      if(this.selectEnd){
         this.selectIslands();
      }
      this.selectStart = 0;
      this.selectEnd = 0;
      this.isSelecting = false;

    },

    selectedIslandIds: function(){
      return _.pluck(this.selectedIslands, 'id');
    },

    selectIslands: function(){
      var allIslands = Game.entityManager.getEntitiesByType('island');
      this.selectedIslands = [];

      var selectionRect = {
        pos: {x: Game.viewport.pos.x +  this.selectStart.x,
              y: Game.viewport.pos.y + this.selectStart.y},
        size: {x: this.selectEnd.x - this.selectStart.x,
               y: this.selectEnd.y - this.selectStart.y}
      }
      _.each(allIslands, function(island){
          if(island.player_id !== this.id){
            island.selected = false;
            return;
          };

          if(utils.rectsIntersect(selectionRect, island)){
             island.selected = true;
             this.selectedIslands.push(island);
          } else{
             island.selected = false;
          }




      }, this);


    },

});
if(module){
    module.exports = Player;
}
