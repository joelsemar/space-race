var log = false;
var  _ = require('underscore'),
    BaseServer = require("./baseserver.js"),
    BaseHttpController = require('./basehttpcontroller.js').BaseHttpController,
    Game = require('./game.js');

class GameServer extends  BaseServer {
    constructor(config){
        super(config);
        this.name =  "GameServer";
        // how many ms to wait to abandon a game after everyone disconnects
        this.abandonGameAfter =  20000;
        this.game = null;
    }

    get httpRoutes(){
        return {
            '/game':  new GameHttpController(this)
        }
    }

    get remoteMethods(){
        return  ["register", "attack", "upgradePurchase"];
    }

    onInit (){
        this.apiClient.getCurrentNodeInfo(this.gameUpdate.bind(this))
    }


    gameUpdate(gameData){
        this.game = new Game(this.apiClient, gameData);
        this.game.setPlayers(gameData.players);
    }

    register(data, socket) {
        this.log("Attempting to register: {{user}}" , {user: JSON.stringify(data)});
        if(!this.game){
            this.log("user {{user}} attempted to connect to inactive node (no game) ", {user: JSON.stringify(data)})
            socket.emit("gameReset");
            return;
        }

        var player = this.game.connectPlayer(data.tok, socket);
        if (!player) {
            this.log("Player " + data.tok + " not found")
            socket.emit('tokenFail');
            return;
        }
        this.log("Player " + player.nickname + " connected.")
        socket.emit('gameStart', {
            id: player.id,
            color: player.color,
            nickname: player.nickname,
            alive: true
        });
        socket.token = data.tok;
        socket.nickname = player.nickname;
        this.apiClient.updateNode(this.nodeType, {
            action: "start"
        });
        // gameserver clients *must* be subscribed to channel updates
        this.subscribe(data, socket)

    }

    attack(data, socket) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        this.log('received attack signal ' + JSON.stringify(data));
        var selectedIslands = this.game.entityManager.entitiesByIds(data.i);
        selectedIslands = _.filter(selectedIslands, (i) => i.playerId == player.id)
        var target = this.game.entityManager.entityById(data.t);
        _.map(selectedIslands, function (i) {
            i.selected = true
        });
        player.attack(target);
        this.game.updatePlayers();

    }

    upgradePurchase (data, socket) {
        var player = this.game.playerByToken(data.tok);
        if (!player) {
            return;
        }
        this.log('received upgrade request: ' + JSON.stringify(data));
    }

    updateClients () {
        super.updateClients(this.game.getUpdate());
    }

    disconnect (socket) {
        if(!this.game){
            return;
        }
        this.game.disconnectPlayer(socket.token);
        this.log("Player " + socket.nickname + " disconnected.")
        this.log("Remaining players: " + JSON.stringify(this.game.players));
        if (!this.game.allPlayersConnected()) {
            setTimeout(() => {this.abandonGame()}, this.abandonGameAfter)
        }
    }

    abandonGame() {
        if (!this.game.allPlayersConnected()) {
            this.log("All players have been disconnected for " + this.abandonGameAfter / 1000 + " seconds..finding a new game.")
            this.nodeReset();
        }
    }

    nodeReset() {
        this.game.stop();
        delete this.game.world;
        delete this.game;
        this.game = null;

        this.apiClient.updateNode(this.nodeType, {
            action: "stop",
            available: "true"
        });
    }

    nodePayload (){
        return {
            host: this.host,
            available: this.game === null,
            node_tag: this.nodeTag
        }

    }
}

class GameHttpController extends BaseHttpController {

    update (req, onComplete){
        console.log("GAMESERVER: Received: " + JSON.stringify(req.body));
        this.server.gameUpdate(req.body);
        onComplete();
    }

}


module.exports = GameServer;
