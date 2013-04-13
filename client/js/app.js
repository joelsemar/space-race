

var World = BaseWorld.extend({

  fps: 24,
  islandImageSrc: 'img/luna.png',
  shipImageSrc: 'img/ship.png',
  players: [],
  init: function(id, players){
     this._super(id, players);
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
      _.each(data.players, function(player){
        if(!Game.entityManager.entityById(player.id)){
          this.players.push(new Player(player));
        }
      }, this);
    }
    if(data.ships){
      _.each(data.ships, function(ship){

        var localShip = Game.entityManager.entityById(ship.id);
        if(localShip){
          localShip.loadFromData(ship);
        }
        else{
          new Ship(ship);
        }
      })
      var localShips = Game.entityManager.getEntitiesByType('ship');
      var remoteShipIds = _.pluck(data.ships, 'id');
      _.each(localShips, function(localShip){
          if(!_.contains(remoteShipIds, localShip.id)){
              Game.entityManager.removeEntity(localShip.id);
          }
      });
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



var Game = {

  debug: false,
  running: false,
  client: true,
  start: function(){
    this.world.run();
    this.drawLoop.run();
    this.running = true;
  },

  sendAttackSignal: function(target){
    this.socket.emit('attack_signal', {token: this.currentPlayer.token, target: target.id,
                                      islands: this.currentPlayer.selectedIslandIds()});
  },

};
//Game.debug = true;

$(function(){
  Game.entityManager = new EntityManager();
  Game.world = new World('client', []);
  Game.viewport = new ViewPort();
  Game.miniMap = new MiniMap();
  Game.drawLoop = new DrawLoop();
  Game.socket = io.connect();
  Game.socket.emit('register', {'token': utils.parseQueryString()['token']});
  Game.socket.on('world_update', function(data){
    Game.world.receiveServerUpdate(data);
  });
  Game.socket.on('player_assign', function(data){
     Game.currentPlayer = new Player(data);
     Game.start();
  });
  $(document.body).keypress(function(e){
    if(e.shiftKey){
      Game.scrollLock = true;
    }
  });
  $(document.body).keyup(function(e){
    if(e.shiftKey){
      Game.scrollLock = false;
    }

  })

});


