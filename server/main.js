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
  , EntityManager = require('../shared/entities/entitymanager.js')
  , Gamemaster = require('./gamemaster.js');





io.sockets.on('connection', function(socket){
   id = utils.guid();
   socket.on('register', function(data){
  
      var player = Gamemaster.getPlayerWithToken(data.token);
      if (!player){
         return;
      }
      console.log("Player " + token + " connected");
      socket.emit('player_assign', {id: player.token, color: player.color});
   });

   socket.on('attack_signal', function(data){
      console.log('receieved attack signal ' + JSON.stringify(data));
      var selectedIslands = Game.entityManager.entitiesByIds(data.islands);
      console.log("Attacking With: " + JSON.stringify(selectedIslands));
      var player = Game.playerByToken(data.token);
      var target = Game.entityManager.entityById(data.target);
      _.map(selectedIslands, function(i){i.selected = true});
      player.attack(target);
      Game.world.updateWorld();


   });
});




updateWorld = function(gameID, data){
  io.sockets.in(gameID).emit('world_update', data);
}

app.get('/', function (req, res) {
  res.sendfile(path.resolve('../client/index.html'));
});

app.use(express.static(path.resolve('../client')));


server.listen(8080);
