var log = false;
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routing = require('./routing')
  , routes  = require('./routes')
  , io = require('socket.io').listen(server, {log: log})
  , _ = require('underscore')
  , path = require('path')
  , Class = require('../shared/lib/class.js')
  , utils = require('../shared/lib/utils.js')
  , Player = require('../shared/entities/player.js')
  , EntityManager = require('../shared/entities/entitymanager.js');

Game = require('./game.js');
RUNNING_ON_CLIENT = false;


io.sockets.on('connection', function(socket){
   id = utils.guid();
   socket.on('register', function(data){
  
      var player = Game.addPlayer(data.token);
      if (!player){
         return;
      }
      console.log("Player " + player.id + " connected");
      socket.emit('player_assign', {id: player.id, color: player.color});
   });

   socket.on('attack_signal', function(data){
      console.log('receieved attack signal ' + JSON.stringify(data));
      var selectedIslands = Game.entityManager.entitiesByIds(data.islands);
      console.log("Attacking With: " + JSON.stringify(selectedIslands));
      var player = Game.playerByToken(data.token);
      var target = Game.entityManager.entityById(data.target);
      _.map(selectedIslands, function(i){i.selected = true});
      player.attack(target);
      Game.world.updateClient();


   });
});




updateClient = function(data){
  io.sockets.emit('world_update', data);
}

app.get('/', function (req, res) {
  res.sendfile(path.resolve('../client/index.html'));
});

app.use(express.static(path.resolve('../client')));


server.listen(8080);
