var World = require('./world.js'),
    utils = require('../shared/lib/utils.js'),
    Player = require('../shared/entities/player.js'),
    Bot = require('../shared/entities/bot.js'),
    BaseGame = require('../shared/lib/basegame.js'),
    EntityManager = require('../shared/entities/entitymanager.js'),
    _ = require("underscore");

var Game = BaseGame.extend({

    running: false,
    lastClientUpdate: 0,
    clientUpdateInterval: 500,
    players: [],
    botNames: ["Boomer", "Maverick", "Roundhouse", "Rex", "Goose", "Bandit", "Chopper"],
    numBots: 0,
    colors: ['blue', 'red', 'green', "brown", "orange", "purple", "yellow"],
    sockets: {},

    init: function (apiClient, gameData) {
        this.entityManager = new EntityManager();
        this.apiClient = apiClient;
        this.id = gameData.id;
        this.name = gameData.name;
        this.numBots = gameData.num_bots;
    },

    step: function () {
        this._super();
        this.lastClientUpdate += this.currentTick;
        if (this.lastClientUpdate > this.clientUpdateInterval) {
            this.updatePlayers();
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

    connectPlayer: function (token, socket) {
        var player = _.findWhere(this.players, {
            token: token
        });
        if (!player) {
            console.log("No players found in: " + JSON.stringify(this.players) + " for token: " + token);
            return false;
        }
        player.connected = true;
        this.sockets[player.id] = socket;

        if (!this.running && this.allPlayersConnected()) {
            this.start();
        }

        return player;
    },

    disconnectPlayer: function (token) {
        var player = _.findWhere(this.players, {
            token: token
        });
        if (player) {
            player.connected = false;
        }
    },

    allPlayersConnected: function () {
        return _.every(_.pluck(this.players, 'connected'));
    },

    setPlayers: function (players) {

        var colors = utils.shuffle(this.colors);
        _.each(players, (player, idx) => {
            this.players.push(new Player({
                color: colors[idx],
                id: player.id,
                token: player.token,
                nickname: player.nickname,
                connected: false,
                alive: true
            }));
            colors.splice(idx, 1);
        });
        for (var i = 0; i < this.numBots; i++) {
            var nickname = utils.random(this.botNames);
            new Bot({
                color: this.colors[i],
                nickname: nickname,
                connected: true,
                alive: true
            });

        }
        this.log("Initialized with players: " + JSON.stringify(this.players))
    },

    sendAttackSignal: function () {},

    playerByToken: function (token) {
        return _.findWhere(this.players, {
            token: token
        });
    },


    start: function () {
        this.world = new World(this.size, this.entityManager, this.id, this.sectorSize);
        this.running = true;
        this.run();
    },

    updatePlayers: function () {
        for (var player of this.players) {
            this.sendPlayerUpdate(player);
        }

    },

    win: function () {
        this.log("Shutting down. Game Over.")
        this.updatePlayers();
        this.stop();
        releaseGameNode();
    },

    sendPlayerUpdate: function (player) {
        var update = {
            size: this.size,
            islands: this.filterVisibleEntities(player.id, this.world.islandSummary()),
            ships: this.filterVisibleEntities(player.id, this.world.shipSummary()),
            players: this.world.playerSummary(),
            seenMap: this.seenMap,
            visibleSectorMap: this.visibleSectorMap

        }
        var socket = this.sockets[player.id];
        if (!socket) {
            console.log("No socket for player: " + JSON.stringify(player))
            return;
        }
        this.sockets[player.id].emit("serverUpdate", update);

    },

    filterVisibleEntities: function (playerId, entities) {
        var ret = [];
        for (var entity of entities) {
            if (this.visibleSectorMap[playerId][entity.sector] || entity.playerId == playerId) {
                ret.push(entity);
            }
        }
        return ret;
    }

});

module.exports = Game;
