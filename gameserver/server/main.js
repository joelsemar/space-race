var GameServer = require("./gameserver.js"),
    LobbyServer = require("./lobbyserver.js"),
    ApiClient = require("./api.js"),
    CONFIG = require("./config.js");

var apiClient = new ApiClient(CONFIG.apiHost);
var gameServer = new GameServer(apiClient);
gameServer.run(CONFIG.gameServerPort);

updateClients = function(data) {
    gameServer.updateClients();
}
getGame = function() {
    return gameServer.game;
}

if (CONFIG.lobbyServerPort) {
    new LobbyServer(apiClient).run(CONFIG.lobbyServerPort);
}
