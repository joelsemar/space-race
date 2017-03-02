var log = false;
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {
        log: log
    }),
    BaseServer = require("./baseserver.js"),
    path = require('path'),
    _ = require('underscore'),
    request = require("request");

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var port = 7001;
var apiHost = "http://127.0.0.1:8000";
var tokenMap = {};

var LOBBY_PING_INTERVAL = 2000;

var LobbyServer = BaseServer.extend({
    name: "LobbyServer",
    joinMessageTemplate: _.template("{{nickname}} has joined."),
    leftMessageTemplate: _.template("{{nickname}} has left."),
    systemNick: "SYSTEM",
    remoteMethods: ["message", "joinChat", "subscribe"],

    run: function(port) {
        this._super(port);
        this.getLobbyInfo();
    },

    joinGameChat: function(data, socket) {
        var chat_id = "game_" + data.id;
        socket.join(chat_id);
        console.log("Player joined chat: " + JSON.stringify(data));
    },

    joinChat: function(data, socket) {
        var player = this.auth(data, () => {
            // this only gets called if api auth is successful
            this.joinChat(data, socket);
        })
        if (!player) {
            return;
        }
        console.log(_.template("Player {{nickname}} joined chat: {{room}} ")({
            nickname: player.nickname,
            room: data.r
        }));
        socket.join(data.r);
        this.io.sockets.in(data.r).emit("message", this.buildJoinMessage(player.nickname));
        if (socket.room) {
            this.io.sockets.in(socket.room).emit("message", this.buildLeaveMessage(player.nickname));
        }
        socket.room = data.r;
        socket.nickname = player.nickname;

    },

    disconnect: function(socket) {
        console.log("dicsonnect event")
        if (!socket.nickname || !socket.room) {
            return;
        }
        this.io.sockets.in(socket.room).emit("message", this.buildLeaveMessage(socket.nickname));

    },

    buildJoinMessage: function(nickname) {
        return this.buildSystemMessage({
            nickname: nickname
        }, this.joinMessageTemplate);
    },

    buildLeaveMessage: function(nickname) {
        return this.buildSystemMessage({
            nickname: nickname
        }, this.leftMessageTemplate);
    },

    buildSystemMessage: function(opts, template) {
        return {
            s: this.systemNick,
            m: template(opts)
        }

    },

    message: function(data, socket) {
        var player = this.auth(data)
        if (!player || !socket.room) {
            return;
        }

        var payload = {
            m: data.m,
            s: player.nickname,
        }
        this.io.sockets.in(socket.room).emit("message", payload);
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
