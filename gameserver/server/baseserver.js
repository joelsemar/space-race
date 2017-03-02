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
    remoteMethods: [],
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

        })
    },

    run: function(port) {
        this.server.listen(port);
        console.log(this.name + " listening on port " + port);
    },

    updateClients: function(data) {
        this.io.sockets.emit('serverUpdate', data);
    }

})

module.exports = BaseServer;
