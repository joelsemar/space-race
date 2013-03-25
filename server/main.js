var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routing = require('./routing')
  , routes  = require('./routes')
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , path = require('path')
  , guid = require('../shared/lib/guid.js')
  , World = require('./worldserver.js');


var currentPlayers = []
var neededPlayers = 1;
var currentWorlds = [];
currentWorld = undefined;


io.sockets.on('connection', function(socket){
   currentPlayers.push({id: guid(), socket: socket});
   if(currentPlayers.length === neededPlayers){
      var newWorldId = 'world_' + (currentWorlds.length + 1);
      currentWorld = new World(newWorldId, currentPlayers);
      console.log("Creating world "  + newWorldId);
       
      currentWorld.run();
   }
});



updateWorld = function(data){
  io.sockets.emit('world_update', data);
}
     
app.get('/', function (req, res) {
  res.sendfile(path.resolve('../client/index.html'));
});

//app.get('/console', function (req, res) {
//  res.sendfile(__dirname + '/static/console.html');
//  res.header("X-Frame-Options", "ALLOW FROM *");
//});

app.use(express.static(path.resolve('../client')));


server.listen(8080);
