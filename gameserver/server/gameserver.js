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
    log: false,
    remoteMethods: ["register", "attack", "upgradePurchase"],

    init: function(apiClient) {
        this._super(apiClient);
        this.game = new Game(this.apiClient);
    },

    run: function(port) {
        this._super(port);

        var getNodeInfo = () => {
            this.apiClient.getCurrentNodeInfo((node) => {
                this.game.setPlayers(node.current_game.players);
            });
        }

        if (!this.apiClient.token) {
            var nodePayload = {
                host: "127.0.0.1",
                port: port
            }
            var onRegister = this.apiClient.getCurrentNodeInfo.bind(this.apiClient);
            this.apiClient.registerNode(nodePayload, getNodeInfo);
        } else {
            getNodeInfo();
        }

    },


    register: function(data, socket) {
        console.log("Attempting to register: " + JSON.stringify(data));

        var player = this.game.connectPlayer(data);
        if (!player) {
            socket.emit('tokenFail');
            return;
        }
        console.log("Player " + JSON.stringify(player) + " connected");
        socket.emit('gameStart', {
            id: player.id,
            color: player.color,
            nickname: player.nickname
        });
        this.apiClient.updateNode({
            action: "start"
        });
        // gameserver clients *must* be subscribed to channel updates
        this.subscribe(data, socket)

    },

    attack: function(data) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        console.log('received attack signal ' + JSON.stringify(data));
        var selectedIslands = this.game.entityManager.entitiesByIds(data.i);
        selectedIslands = _.filter(selectedIslands, (i) => i.playerId == player.id)
        console.log("Attacking With: " + JSON.stringify(selectedIslands));
        var target = this.game.entityManager.entityById(data.t);
        _.map(selectedIslands, function(i) {
            i.selected = true
        });
        player.attack(target);
        this.updateClients();

    },

    upgradePurchase: function(data) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        console.log('received upgrade request: ' + JSON.stringify(data));
    },

    updateClients: function() {
        this._super(
            this.game.getUpdate()
        );
    },

});

module.exports = GameServer;
