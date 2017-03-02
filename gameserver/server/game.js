var World = require('./world.js'),
    Player = require('../shared/entities/player.js'),
    BaseGame = require('../shared/lib/basegame.js'),
    EntityManager = require('../shared/entities/entitymanager.js');

var Game = BaseGame.extend({

    running: false,
    lastClientUpdate: 0,
    clientUpdateInterval: 500,
    players: [],
    colors: ['blue', 'red', 'red', 'green'],

    init: function(apiClient) {
        this.entityManager = new EntityManager();
        this.apiClient = apiClient;
    },

    step: function() {
        this._super();
        this.lastClientUpdate += this.currentTick;
        if (this.lastClientUpdate > this.clientUpdateInterval) {
            updateClients();
            this.lastClientUpdate = 0;
        }
    },

    connectPlayer: function(playerData) {
        var player = _.findWhere(this.players, {
            token: playerData.tok
        });
        if (!player) {
            console.log("No players found in: " + JSON.stringify(this.players) + " for token: " + token);
            return false;
        }
        player.connected = true;

        if (!this.running && _.every(_.pluck(this.players, 'connected'))) {
            this.start();
        }

        return player;
    },

    setPlayers: function(players) {
        _.each(players, (player, idx) => {
            this.players.push(new Player({
                color: this.colors[idx],
                id: player.id,
                token: player.token,
                nickname: player.nickname,
                connected: false
            }));

        });
    },

    sendAttackSignal: function() {},

    playerByToken: function(token) {
        return _.findWhere(this.players, {
            token: token
        });
    },


    start: function() {
        this.world = new World(this.players, this.size);
        this.running = true;
        this.run();
    },

    getUpdate: function() {
        return {
            size: this.size,
            islands: this.world.islandSummary(),
            ships: this.world.shipSummary(this.entityManager),
            players: this.world.playerSummary()

        }

    },


});

module.exports = Game;
