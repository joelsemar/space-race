var  World = require('./worldserver.js')
    , Player = require('../shared/entities/player.js')
    , EntityManager = require('../shared/entities/entitymanager.js');

var Game = Class.extend({
    
    maxPlayers: 2,
    colors: ['blue', 'yellow', 'red', 'green'],
    tokens: ['player1'],

    init: function(){
       this.entityManager =  new EntityManager();
    },

    addPlayer: function(token){
        var color = this.colors.splice(0,1)[0];
        var player = new Player({id: token, color: color});
        if (!_.contains(this.tokens, token) || _.contains(_.pluck(this.currentPlayers, 'token'), token)){
           return false;
        }

        this.currentPlayers.push(player);
        if (this.currentPlayers.length === this.maxPlayers){
            this.start();
        }
        return player;
    },

    currentPlayers: [{id: 'computer', color: 'red'}],
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
      this.world = new World(this.currentPlayers);
      console.log("Creating world "  + this.world.id);
      this.world.run();
      this.running = true;
    },

  
});

module.exports = new Game();

