var log = false;
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {
        log: log
    }),
    BaseServer = require("./baseserver.js"),
    path = require('path'),
    request = require("request");

var port = 7001;
var apiHost = "http://127.0.0.1:8000";
var tokenMap = {};

var LOBBY_PING_INTERVAL = 2000;

var LobbyServer = BaseServer.extend({
    name: "LobbyServer",
    tokenMap: {},
    remoteMethods: ["joinGameChat", "message"],

    run: function(port) {
        this._super(port);
        this.getLobbyInfo();
    },

    joinGameChat: function(data, socket) {
        var chat_id = "game_" + data.id;
        socket.join(chat_id);
        console.log("Player joined chat: " + JSON.stringify(data));
    },

    message: function(data) {
        var chatId = "game_" + data.gameId;
        var payload = {
            message: data.message
        }
        if (!this.tokenMap[data.playerToken]) {
            this.apiClient.getPlayerForToken(data.playerToken, (player) => {
                payload.sender = player.nickname;
                this.tokenMap[data.playerToken] = player.nickname;
                this.io.sockets.in(chatId).emit("message", payload);
            });
        } else {
            payload.sender = this.tokenMap[data.playerToken];
            this.io.sockets.in(chatId).emit("message", payload);
        }
    },

    getLobbyInfo: function() {
        this.io.clients((err, clients) => {
            var retryCallback = this.getLobbyInfo.bind(this);
            if (!clients.length) {
                setTimeout(retryCallback, LOBBY_PING_INTERVAL);
                return;
            } else {
                this.apiClient.getGames((response) => {
                    this.updateClients(response);
                    setTimeout(retryCallback, LOBBY_PING_INTERVAL);
                });
            }
        });

    },

});

module.exports = LobbyServer;
