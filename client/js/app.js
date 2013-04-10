

var World = BaseWorld.extend({

  fps: 30,
  islandImageSrc: 'img/luna.png',
  shipImageSrc: 'img/ship.png',
  init: function(){
     this._super();
     this.islandImage = new Image();
     this.islandImage.src = this.islandImageSrc;
     this.shipImage = new Image();
     this.shipImage.src = this.shipImageSrc;
     
  },
  receiveServerUpdate: function(data){
    this.islands = [];
    _.each(data.islands || [], function(island){
       var localIsland = Game.entityManager.entityById(island.id);
       if(localIsland){
         localIsland.loadFromData(island);
       }
       else{
          new Island(island);
       }
    },this);
    if(data.players){
      this.players = data.players;
    }
    //this.ships = data.ships;
    this.size = data.size;
  },

});


var DrawLoop = Class.extend({

  init: function(){
    window.requestAnimationFrame =  window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  },

  run: function(){
   requestAnimationFrame(this.draw.bind(this));
  },

  draw: function(){
    Game.viewport.clear();
    Game.entityManager.drawEntities();
    requestAnimationFrame(this.draw.bind(this));
  },
 
});

var Player = Entity.extend({
    selectedIslands: [],
    selectStart: false,
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


var Game = {
  
  running: false,
  start: function(){
    this.world.run();
    this.drawLoop.run();
    this.running = true;
  },
 
};

$(function(){
  Game.entityManager = new EntityManager();
  Game.world = new World();
  Game.viewport = new ViewPort();
  Game.miniMap = new MiniMap();
  Game.drawLoop = new DrawLoop();
  this.socket = io.connect();
  this.socket.emit('register', {'token': 'test_token'});
  this.socket.on('world_update', function(data){
    Game.world.receiveServerUpdate(data);
  });
  this.socket.on('player_assign', function(data){
     Game.currentPlayer = new Player(data);
     Game.start();
  });
});


