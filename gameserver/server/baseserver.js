var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    _ = require('underscore'),
    path = require('path'),
    Game = require('./game.js'),
    Class = require('../shared/lib/class.js'),
    ApiClient = require("./api.js");

var BaseServer = Class.extend({
    name: "BaseServer",
    tokenMap: {},
    remoteMethods: [],
    updatesChannel: "updates",
    init: function(apiClient) {
        this.apiClient = apiClient;
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = io.listen(this.server, {
            log: this.log
        })
        this.io.sockets.on('connection', (socket) => {
            _.each(this.remoteMethods, (methodName) => {
                if (this[methodName]) {
                    // wrap the method, so we can pass the socket in along with the data.
                    var callback = (data) => {
                        this[methodName](data, socket);
                    }
                    socket.on(methodName, callback);
                }
            });
            socket.on("disconnect", () => {
                this.disconnect(socket);
            })
        })
    },

    run: function(port) {
        this.server.listen(port);
        console.log(this.name + " listening on port " + port);
    },

    updateClients: function(data) {
        this.io.sockets.in(this.updatesChannel).emit('serverUpdate', data);
    },

    auth: function(data, cb) {
        var token = data.tok;
        if (this.tokenMap[token]) {
            return this.tokenMap[token];
        }
        if (cb) {
            this.apiClient.getPlayerForToken(token, (player) => {
                this.tokenMap[token] = player;
                cb()
            });
        }
    },

    // subscribes the client to the "updates" channel for the server
    subscribe: function(data, socket) {
        var player = this.auth(data, () => {
            // this only gets called if api auth is successful
            this.subscribe(data, socket);
        })
        socket.join(this.updatesChannel);
    },
    disconnect: function() {},

});
module.exports = BaseServer;
