var  World = require('./worldserver.js')
    , Player = require('../shared/entities/player.js')
    , EntityManager = require('../shared/entities/entitymanager.js');

var Gamemaster = {

  games: {},

  getPlayerWithToken: function(tokenString){

    var token = this.tokenFromString(tokenString);
    var game = this.games[token.gameID];

    if (!game){
      game = new Game(token.gameID);
      this.games[token.gameID] = game;
    }
    game.addPlayer(token.playerID);
    return game;
  },

  tokenFromString: function(tokenString){
   
     var parts = tokenString.split('|');

     return {gameID: parts[0],
             playerID: parts[1]}
  },

}

Game = Class.extend({
    
    maxPlayers: 2,
    colors: ['blue', 'yellow', 'red', 'green'],
    tokens: ['player1'],

    init: function(id){
       this.id = id;
       this.entityManager =  new EntityManager();
    },

    addPlayer: function(token){
        var color = this.colors.splice(0,1);
        var player = new Player({id: token, color: color});
        this.currentPlayers.push(player);
        if (this.currentPlayers.length === this.maxPlayers){
            this.start();
        }
    },

    currentPlayers: [{id: 'computer', color: 'blue'}],
    client: false,
    currentWorlds: [],
    sendAttackSignal: function(){},

    playerByToken: function(token){
       return this.entityManager.entityById(token);
    },

    running: false,

    registerWithToken: function(token){
        return token;
    },

    start: function(){
      this.world = new World(this.id, this.currentPlayers);
      console.log("Creating world "  + this.world.id);
      this.world.run();
      this.running = true;
    },

    updateWorld: function(data){
      io.sockets.in(this.id).emit('world_update', data);
    },
  
});

module.exports = Gamemaster;
