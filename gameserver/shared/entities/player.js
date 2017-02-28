if (require){
  var Entity = require('./entity.js'),
      utils = require('../lib/utils.js');

}

var Player = Entity.extend({
    type: 'player',
    doubleClickDelay: 300,
    pendingDoubleClick: false,
    selectStart: false,
    resourcesGathered: 0,


    draw: function(){
       var ctx = Game.viewport.ctx;
       if(this.selectStart && this.selectEnd){
         console.log('drawing select box')
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
      this.selectStart = new Vector(x, y);
      this.isSelecting = true;
      var x = x + Game.viewport.pos.x;
      var y = y + Game.viewport.pos.y;
      var point = new Vector(x, y);
      var islands = Game.entityManager.entitiesByType('island');

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

      if(this.pendingDoubleClick && this.pendingDoubleClick === islandClicked){
        this.selectVisible();
        this.pendingDoubleClick = false;
        return;
      }

      else if(this.selectedIslands().length){
        this.attack(islandClicked);
      }
      else{
        this.select(islandClicked);
        this.pendingDoubleClick = islandClicked;
        setTimeout(function(){
          this.pendingDoubleClick = false;
        }.bind(this), this.doubleClickDelay);


      }
      this.selectStart = 0;

    },

    select: function(target){
      if(target.playerId === this.id){
         target.selected = true;
      }
    },

    unSelect: function(target){
       target.selected = false;
    },

    clearSelection: function(){
      _.each(Game.entityManager.entitiesByType('island'), function(island){
        island.selected = false;
      });
    },

    selectedIslands: function(){
      return Game.entityManager.entitiesByType('island', function(i){
        return i.selected === true && i.playerId === this.playerId;
      }.bind(this));
    },

    attack: function(target){
      Game.sendAttackSignal(target);
      _.each(this.selectedIslands(), function(island){
        island.attack(target);
      },this);
      this.clearSelection();
    },


    updateSelect: function(x, y){
      this.selectEnd = new Vector(x, y)
    },


    selectVisible: function(){
      _.each(Game.entityManager.entitiesByType('island'), function(island){
        if(island.playerId === this.id && utils.rectsIntersect(island, Game.viewport)){
          this.select(island);
        }
      } , this);
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
      return _.pluck(this.selectedIslands(), 'id');
    },

    selectIslands: function(){
      var allIslands = Game.entityManager.entitiesByType('island');
      var selectPos = {x: Game.viewport.pos.x +  this.selectStart.x, y: Game.viewport.pos.y + this.selectStart.y};
      var selectSize =  {x: this.selectEnd.x - this.selectStart.x, y: this.selectEnd.y - this.selectStart.y};

      var selectionRect = new Rect(selectPos, selectSize);
      _.each(allIslands, function(island){
          if(island.playerId !== this.id){
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
