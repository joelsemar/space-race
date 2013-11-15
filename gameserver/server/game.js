var  World = require('./worldserver.js')
    , Player = require('../shared/entities/player.js')
    , EntityManager = require('../shared/entities/entitymanager.js');

var Game = Class.extend({
    
    players: [],
    colors: ['blue', 'yellow', 'red', 'green'],
    tokens: ['player1', 'player2', 'player3'],

    init: function(){
       this.entityManager =  new EntityManager();
    },

    addPlayer: function(token){
        var player = _.findWhere(this.players, {'id': token});
        if(!player){
           return false;
        }
        player.connected = true;
       
        if (!this.running && _.every(_.pluck(this.players, 'connected'))){
            this.start();
        }

        return player;
    },

    initPlayers: function(){
       _.each(this.tokens, function(id, idx){
         var connected = false;
         if(id === 'computer'){
            connected = true;
         }
         this.players.push(new Player({color: this.colors[idx], id: id, connected: connected}));
       }, this )
    },

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
      this.world = new World(this.players);
      this.world.run();
      this.running = true;
    },

  
});

module.exports = new Game();

