var GameServer = require("./gameserver.js"),
    LobbyServer = require("./lobbyserver.js"),
    ApiClient = require("./api.js"),
    CONFIG = require("./config.js");

var apiClient = new ApiClient(CONFIG.apiHost);
var gameServer = new GameServer({
    apiClient: apiClient,
    host: CONFIG.host,
    port: CONFIG.gameServerPort
});
gameServer.run();
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

if (CONFIG.lobby) {
    var apiClient = new ApiClient(CONFIG.apiHost, "./chat_node_token");
    new LobbyServer({
        apiClient: apiClient,
        host: CONFIG.host,
        port: CONFIG.lobbyServerPort
    }).run();
}
