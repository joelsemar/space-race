var BaseServer = require("./baseserver.js"),
    BaseHttpController = require('./basehttpcontroller.js').BaseHttpController,
    _ = require('underscore');

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var LOBBY_PING_INTERVAL = 2000;

class LobbyServer extends BaseServer {

    get nodeType(){
        return "chatnode";
    }

    get remoteMethods(){
        return ["message", "joinChat", "subscribe"];
    }

    get httpRoutes (){
        return {
            '/lobby' : new LobbyHttpController(this),
        }
    }

    constructor(config){
        super(config);
        this.name =  "LobbyServer";
        this.joinMessageTemplate =  _.template("{{nickname}} has joined.");
        this.leftMessageTemplate =  _.template("{{nickname}} has left.");
        this.systemNick = "SYSTEM";
        this.rooms = {};
    }

    joinChat(data, socket) {
        var player = this.auth(data, () => {
            // this only gets called if api auth is successful
            this.joinChat(data, socket);
        })
        if (!player) {
            return;
        }

        this.log("Player {{nickname}} joined chat: {{room}}", {
            nickname: player.nickname,
            room: data.r
        });

        socket.join(data.r);
        this.joinRoom(player, data.r);
        this.io.sockets.in(data.r).emit("message", this.buildJoinMessage(player.nickname));
        if (socket.room) {
            this.io.sockets.in(socket.room).emit("message", this.buildLeaveMessage(player.nickname));
        }
        socket.room = data.r;
        socket.playerId = player.id;
        socket.nickname = player.nickname;

    }

    joinRoom(player, room){
        if(!this.rooms[room]){
            this.rooms[room] = {};
        }
        this.rooms[room][player.id] = player.nickname;
        this.updateRoomList(room);
    }

    leaveRoom(playerId, room){
        this.rooms[room][playerId] = null;
        this.updateRoomList(room);
    }

    disconnect(socket) {
        if (!socket.nickname || !socket.room) {
            return;
        }
        this.leaveRoom(socket.playerId, socket.room);
        this.log("Player {{nickname}} left chat: {{room}}",
                { nickname: socket.nickname, room: socket.room });
        this.io.sockets.in(socket.room).emit("message", this.buildLeaveMessage(socket.nickname));
        this.updateRoomList(socket.room);

    }

    buildJoinMessage(nickname) {
        return this.buildSystemMessage({
            nickname: nickname
        }, this.joinMessageTemplate);
    }

    buildLeaveMessage(nickname) {
        return this.buildSystemMessage({
            nickname: nickname
        }, this.leftMessageTemplate);
    }

    buildSystemMessage(opts, template) {
        return {
            s: this.systemNick,
            m: template(opts)
        }
    }

    message(data, socket) {
        var player = this.auth(data);
        if (!player || !socket.room) {
            return;
        }

        var payload = {
            m: data.m,
            s: player.nickname,
        }
        this.io.sockets.in(socket.room).emit("message", payload);
    }
    updateRoomList(room){
        this.io.sockets.in(room).emit("playerList", _.values(this.rooms[room]));
    }

}


class LobbyHttpController extends BaseHttpController {

    update (req, onComplete) {
        this.server.log("received: " + JSON.stringify(req.body))
        this.server.updateClients(req.body);
        onComplete();
    }

}


module.exports = LobbyServer;
