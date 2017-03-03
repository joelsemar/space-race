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
        var alivePlayers = this.entityManager.entitiesWhere({
            type: "player",
            alive: true
        });
        if (alivePlayers.length === 1) {
            this.win();
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

        if (!this.running && this.allPlayersConnected()) {
            this.start();
        }

        return player;
    },

    disconnectPlayer: function(token) {
        var player = _.findWhere(this.players, {
            token: token
        });
        if (player) {
            player.connected = false;
        }
    },

    allPlayersConnected: function() {
        return _.every(_.pluck(this.players, 'connected'));
    },

    setPlayers: function(players) {
        console.log(players)
        _.each(players, (player, idx) => {
            this.players.push(new Player({
                color: this.colors[idx],
                id: player.id,
                token: player.token,
                nickname: player.nickname,
                connected: false,
                alive: true
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

    win: function() {
        this.stop();
        if (!RUNNING_ON_CLIENT) {
            releaseGameNode();
        }
    },


});

module.exports = Game;
