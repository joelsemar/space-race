var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    _ = require('underscore'),
    bodyParser = require('body-parser'),
    AliveController = require('./basehttpcontroller.js').AliveController,
    ApiClient = require("./api.js");


const HEARTBEAT_INTERVAL = 5000;

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

class BaseServer {

    constructor(config){
        this.name = "BaseSever";
        this.tokenMap =  {};
        this.updatesChannel =  "updates";
        this.apiClient = config.apiClient;
        this.host = config.host;
        this.nodeTag = config.nodeTag;

        this.createServer();
        this.bindRemoteMethods();
        if(this.httpRoutes){
            this.bindRoutes();
        }

    }

    get remoteMethods (){
        return [];
    }

    get nodeType(){
        return "node";
    }

    get httpRoutes () { }

    createServer(){
        this.app = express();
        this.app.use(bodyParser.json())
        this.server = http.Server(this.app);
        this.io = io(this.server);

    }

    bindRoutes(){
        for(var route in this.httpRoutes){
            var controller = this.httpRoutes[route];
            this.app.all(route, controller.request.bind(controller));
        }
        var aliveController = new AliveController(this);
        this.app.all("/alive", aliveController.request.bind(aliveController));

    }

    bindRemoteMethods(){
        this.io.on('connection', (socket) => {
            _.each(this.remoteMethods, (methodName) => {
                if (this[methodName]) {
                    // wrap the method, so we can pass the socket in along with the data.
                    var callback = (data) => {
                        this[methodName](data, socket);
                    }
                    socket.on(methodName, callback);
                }
            });
            socket.on("disconnect", () => {
                this.disconnect(socket);
            })
        })
    }

    run() {
        this.registerNode();
    }

    registerNode(){
        var onRegister = (node) => {
            this.port = node.port
            this.server.listen(this.port);
            this.log("listening on {{port}}", {port: this.port});
            this.heartbeat();
            this.onInit();

        }
        var onRegisterFail = (resp) => {
            this.log("received {{status}} - {{resp}} from api server, token wiped, trying again for new token/port assignment", {status: resp.statusCode,
                                                                                                                                 resp: JSON.stringify(resp.body)})
            setTimeout(this.registerNode.bind(this), 4000)

        }
        this.apiClient.registerNode(this.nodeType, this.nodePayload(), onRegister, onRegisterFail);

    }


    nodePayload (){
        return {
            host: this.host,
            available: true,
            node_tag: this.nodeTag
        }

    }

    heartbeat() {
        var beat = () => {
            this.apiClient.updateNode(this.nodeType, this.nodePayload(), ()=>{});
        }
        this.heartbeatInterval = setInterval(beat, HEARTBEAT_INTERVAL);

    }

    onInit(){}

    updateClients(data) {
        this.io.sockets.in(this.updatesChannel).emit('serverUpdate', data);
    }

    auth(data, cb) {
        var token = data.tok;
        if (this.tokenMap[token]) {
            return this.tokenMap[token];
        }
        if (cb) {
            this.apiClient.getPlayerForToken(token, (player) => {
                this.tokenMap[token] = player;
                cb(player);
            });
        }
    }

    // subscribes the client to the "updates" channel for the server
    // optionally pass "channelName" to sub to custom channels
    subscribe(data, socket) {
        var player = this.auth(data, () => {
            // this only gets called if api auth is successful
            this.subscribe(data, socket);
        })
        var channel = data.channelName || this.updatesChannel;
        socket.join(channel);
    }

    get prefix(){
        return _.template("{{name}}|{{tag}}: ")({name: this.name, tag: this.nodeTag})
    }

    log(msg, args) {
        if(!args){
            console.log(this.prefix + msg);
        }
        else{
            console.log(this.prefix + _.template(msg)(args))
        }
    }

    disconnect() {}

}

module.exports = BaseServer;
