var log = false;
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {
        log: log
    }),
    path = require('path'),
    request = require("request");

var port = 7001;
var api_host = "http://127.0.0.1:8000";

io.sockets.on('connection', function(socket) {
    socket.on('join_game_chat', function(data) {
        var chat_id = "game_" + data.id;
        socket.join(chat_id);
        console.log("Player joined chat: " + JSON.stringify(data));
    });

    socket.on("message", function(data) {
        var chat_id = "game_" + data.game_id;
        io.sockets.in(chat_id).emit("message", data.message);
    })
});


var LOBBY_PING_INTERVAL = 2000;

function getLobbyInfo() {

    io.clients(function(err, clients) {
        if (!clients.length) {
            setTimeout(getLobbyInfo, LOBBY_PING_INTERVAL);
            return;
        } else {
            request.get(api_host + "/games", function(err, response, body) {
                if (err || response.statusCode > 399) {
                    console.log(err);
                    console.log(body);
                } else {
                    updateLobby(body);
                }
                setTimeout(getLobbyInfo, LOBBY_PING_INTERVAL);
            });

        }

    })

}

function updateLobby(data) {
    io.sockets.emit("lobby_update", data);
}



app.get('/', function(req, res) {
    res.sendfile(path.resolve('./static/index.html'));
});
app.get('/gamelobby', function(req, res) {
    res.sendfile(path.resolve('./static/gamelobby.html'));
});

app.use(express.static(path.resolve('./static')));


console.log("Listening on port " + port);
server.listen(port);

getLobbyInfo();
