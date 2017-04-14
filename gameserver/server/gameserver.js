var log = false;
var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    _ = require('underscore'),
    path = require('path'),
    BaseServer = require("./baseserver.js"),
    Game = require('./game.js'),
    World = require("./world.js"),
    ApiClient = require("./api.js");


RUNNING_ON_CLIENT = false;
var GameServer = BaseServer.extend({
    name: "GameServer",
    // how many ms to wait to abandon a game after everyone disconnects
    abandonGameAfter: 20000,
    remoteMethods: ["register", "attack", "upgradePurchase"],

    run: function () {
        this._super();
        this.game = new Game(this.apiClient);
        this.findNewGame();
    },

    findNewGame: function () {
        this.log("Seeking new game.")
        var getNodeInfo = () => {
            this.apiClient.getCurrentNodeInfo((game) => {
                this.log("Found game: " + game.name)
                this.game.setPlayers(game.players);
                this.game.id = game.id;
                this.game.name = game.name;
            });
        }

        if (!this.apiClient.token) {
            this.log("no token stored, registering a new node...")
            var nodePayload = {
                host: this.host,
                port: this.port
            }
            this.apiClient.registerNode(nodePayload, getNodeInfo);
        } else {
            this.log("getting node info with token: " + this.apiClient.token);
            getNodeInfo();
        }

    },


    register: function (data, socket) {
        this.log("Attempting to register: " + JSON.stringify(data));

        var player = this.game.connectPlayer(data, socket);
        if (!player) {
            this.log("Player " + data.tok + " not found")
            socket.emit('tokenFail');
            return;
        }
        this.log("Player " + player.nickname + " connected.")
        socket.emit('gameStart', {
            id: player.id,
            color: player.color,
            nickname: player.nickname,
            alive: true
        });
        socket.token = data.tok;
        socket.nickname = player.nickname;
        this.apiClient.updateNode({
            action: "start"
        });
        // gameserver clients *must* be subscribed to channel updates
        this.subscribe(data, socket)

    },

    attack: function (data, socket) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        this.log('received attack signal ' + JSON.stringify(data));
        var selectedIslands = this.game.entityManager.entitiesByIds(data.i);
        selectedIslands = _.filter(selectedIslands, (i) => i.playerId == player.id)
        var target = this.game.entityManager.entityById(data.t);
        _.map(selectedIslands, function (i) {
            i.selected = true
        });
        player.attack(target);
        this.game.updatePlayers();

    },

    upgradePurchase: function (data, socket) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        console.log('received upgrade request: ' + JSON.stringify(data));
    },

    updateClients: function () {
        this._super(
            this.game.getUpdate()
        );
    },

    disconnect: function (socket) {
        this.game.disconnectPlayer(socket.token);
        this.log("Player " + socket.nickname + " disconnected.")
        this.log("Remaining players: " + JSON.stringify(this.game.players));
        if (!this.game.allPlayersConnected()) {
            setTimeout(this.abandonGame.bind(this), this.abandonGameAfter)
        }
    },

    abandonGame: function () {
        if (!this.game.allPlayersConnected()) {
            this.log("All players have been disconnected for " + this.abandonGameAfter / 1000 + " seconds..finding a new game.")
            this.nodeReset();
        }
    },

    nodeReset: function () {
        this.game.stop();
        delete this.game.world;
        delete this.game;

        this.game = new Game(this.apiClient);
        this.apiClient.updateNode({
            action: "stop",
            available: "true"
        }, this.findNewGame.bind(this));
    },

});

module.exports = GameServer;
