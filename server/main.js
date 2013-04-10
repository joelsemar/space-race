var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routing = require('./routing')
  , routes  = require('./routes')
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , path = require('path')
  , utils = require('../shared/lib/utils.js')
  , EntityManager = require('../shared/entities/entitymanager.js')
  , World = require('./worldserver.js');




Game = {
    currentPlayers: [{id: 'computer', color: 'yellow'}],
    neededPlayers: 2,
    currentWorlds: [],
    availableColors: ['blue', 'yellow', 'white', 'red'],
    socketPool: {},
    entityManager: new EntityManager(),
    registerWithToken: function(token){
        return token;
    }
};

io.sockets.on('connection', function(socket){
   id = utils.guid();
   Game.socketPool[id] = socket;
   socket.on('register', function(data){
      var token = Game.registerWithToken(data.token);
      if (!token){
         return;
      }
      Game.currentPlayers.push({id: token, color: 'blue'});
      socket.emit('player_assign', {id: token, color: 'blue'});
      if(Game.currentPlayers.length === Game.neededPlayers){
        var newWorldId = 'world_' + (Game.currentWorlds.length + 1);
        Game.world = new World(newWorldId, Game.currentPlayers);
        console.log("Creating world "  + newWorldId);
        Game.world.run();
      }
   });
});




updateWorld = function(data){
  io.sockets.emit('world_update', data);
}
     
app.get('/', function (req, res) {
  res.sendfile(path.resolve('../client/index.html'));
});

app.use(express.static(path.resolve('../client')));


server.listen(8080);
