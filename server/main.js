var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routing = require('./routing')
  , routes  = require('./routes')
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , World = require('./worldserver.js');


var currentPlayers = []
var neededPlayers = 1;
var currentWorlds = [];


io.sockets.on('connection', function(socket){
   currentPlayers.push(socket);
   if(currentPlayers.length === neededPlayers){
      world = new World(currentPlayers, 'world_1');
      currentWorlds.push(world);
      world.run();
       
     
   }


});
