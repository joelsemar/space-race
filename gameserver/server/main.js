var log = false;
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    routing = require('./routing'),
    routes = require('./routes'),
    io = require('socket.io').listen(server, {
        log: log
    }),
    _ = require('underscore'),
    path = require('path'),
    ApiClient = require("./api.js");

RUNNING_ON_CLIENT = false;
var port = 8001;
var apiClient = ApiClient("http://127.0.0.1:8000");
Game = require('./game.js');
Game.apiClient = apiClient;


io.sockets.on('connection', function(socket) {
    socket.on('register', function(data) {
        console.log("Attempting to register: " + JSON.stringify(data));


        var player = Game.addPlayer(data.token);
        if (!player) {
            socket.emit('token_fail');
            return;
        }
        console.log("Player " + player.id + " connected");
        socket.emit('game_start', {
            id: player.id,
            color: player.color
        });
    });

    socket.on('attack_signal', function(data) {
        console.log('received attack signal ' + JSON.stringify(data));
        var selectedIslands = Game.entityManager.entitiesByIds(data.i);
        console.log("Attacking With: " + JSON.stringify(selectedIslands));
        var player = Game.playerByToken(data.p);
        var target = Game.entityManager.entityById(data.t);
        _.map(selectedIslands, function(i) {
            i.selected = true
        });
        player.attack(target);
        Game.world.updateClient();

    });

    socket.on("upgrade_purchase", function(data) {
        console.log('received upgrade request: ' + JSON.stringify(data));
    })
});




updateClient = function(data) {
    io.sockets.emit('world_update', data);
}

app.get('/', function(req, res) {
    res.sendfile(path.resolve('../client/index.html'));
});

app.use(express.static(path.resolve('../client')));


console.log("Listening on port " + port);
server.listen(port);
