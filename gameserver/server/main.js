var GameServer = require("./gameserver.js"),
    LobbyServer = require("./lobbyserver.js"),
    ApiClient = require("./api.js"),
    CONFIG = require("./config.js");

RUNNING_ON_CLIENT = false;

updateClients = function (data) {
    gameServer.updateClients();
}
getGame = function () {
    return gameServer.game;
}

releaseGameNode = function () {
    gameServer.nodeReset()
}

let nodeTag = "n1";
if (process.argv.length > 2){
    nodeTag = process.argv[2];

}

var apiClient = new ApiClient(CONFIG.apiHost, nodeTag + "-game_node_token");
var gameServer = new GameServer({
    apiClient: apiClient,
    host: CONFIG.host,
    port: CONFIG.gameServerPort
});

gameServer.run();


if (CONFIG.lobby) {
    var apiClient = new ApiClient(CONFIG.apiHost, nodeTag + "-chat_node_token");
    new LobbyServer({
        apiClient: apiClient,
        host: CONFIG.host,
        port: CONFIG.lobbyServerPort
    }).run();
}
