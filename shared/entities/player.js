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
      console.log('click!');
      this.selectStart = new Vector(x, y);
      this.isSelecting = true;
      var x = x + Game.viewport.pos.x;
      var y = y + Game.viewport.pos.y;
      var point = new Vector(x, y);
      var islands = Game.entityManager.getEntitiesByType('island');
      var islandClicked = false;
      _.each(islands, function(island){
        if (utils.pointInRect(point, island)){
            islandClicked = island;
        }
      }, this);
      if(!islandClicked){
        this.clearSelection()
        return;
      }
      else if(this.selectedIslands.length){
        this.attack(islandClicked);
      }
      else{
        this.select(islandClicked);
      }
      this.selectStart = 0;
      this.isSelected = false;

    },

    select: function(target){
      if(target.player_id !== this.id){
        return;
      }
      target.selected = true;
      this.selectedIslands.push(target);
    },

    unSelect: function(target){
       target.selected = false;
       if(_.contains(this.selectedIslands, target)){
           this.selectedIslands.splice(this.selectedIslands.indexOf(target), 1);
       }
    },

    clearSelection: function(){
      _.each(this.selectedIslands, function(island){
        island.selected = false;
      });
      this.selectedIslands = [];
    },

    attack: function(target){
      Game.sendAttackSignal(target);
      _.each(this.selectedIslands, function(island){
        island.attack(target);
      },this);
      this.clearSelection();
    },


    updateSelect: function(x, y){
      this.selectEnd = new Vector(x, y)
    },

    stopSelect: function(){
      if(this.selectEnd && this.selectEnd.distanceTo(this.selectStart) > 10){
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
      var selectPos = {x: Game.viewport.pos.x +  this.selectStart.x, y: Game.viewport.pos.y + this.selectStart.y};
      var selectSize =  {x: this.selectEnd.x - this.selectStart.x, y: this.selectEnd.y - this.selectStart.y};

      var selectionRect = new Rect(selectPos, selectSize);
      _.each(allIslands, function(island){
          if(island.player_id !== this.id){
            this.unSelect(island);
            return;
          };

          if(utils.rectsIntersect(selectionRect, island)){
             this.select(island);
          } else{
             this.unSelect(island);
          }
      }, this);


    },

});
if(module){
    module.exports = Player;
}
