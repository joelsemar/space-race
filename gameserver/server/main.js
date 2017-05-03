var GameServer = require("./gameserver.js"),
    LobbyServer = require("./lobbyserver.js"),
    ApiClient = require("./api.js"),
    cluster = require('cluster'),
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

if (cluster.isMaster){
    var numWorkers = require('os').cpus().length;

    var pidEnvMap = {};
    if(CONFIG.numWorkers !== undefined){
        numWorkers = CONFIG.numWorkers;
    }
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    let started = 0;

    var next = () => {
        var nodeTag =  "n" + started;
        var env = {nodeTag: nodeTag}
        if(CONFIG.lobby && started === 0){
            env.lobby = true
        }
        var worker = cluster.fork(env);
        pidEnvMap[worker.process.pid] = env;


    }


    cluster.on('online', (worker) => {
        console.log('Worker ' + worker.process.pid + ' is online');
        started += 1;
        if(started < numWorkers){
            next();
        }
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork(pidEnvMap[worker.process.pid]);
    });
    next();

}
else {
    let nodeTag = process.env.nodeTag;
    let apiClient = new ApiClient(CONFIG.apiHost, nodeTag + "-token");
    var gameServer = new GameServer({
        apiClient: apiClient,
        nodeTag: nodeTag,
        host: CONFIG.host
    });

    gameServer.run();


    if (process.env.lobby ) {
        nodeTag = nodeTag + "-lobby"
        let apiClient = new ApiClient(CONFIG.apiHost, nodeTag + "-token");
        new LobbyServer({
            apiClient: apiClient,
            nodeTag: nodeTag,
            host: CONFIG.host
        }).run();
    }


}
