var express = require('express'),
    http = require('http'),
    io = require('socket.io'),
    _ = require('underscore'),
    bodyParser = require('body-parser'),
    ApiClient = require("./api.js");


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
        this.port = config.port;

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
        this.server.listen(this.port);

    }

    bindRoutes(){
        for(var route in this.httpRoutes){
            var controller = this.httpRoutes[route];
            this.app.all(route, controller.request.bind(controller));
        }

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
        this.server.listen(this.port);
        this.log("listening on port " + this.port);

        var nodePayload = {
            host: this.host,
            port: this.port,
            available: true
        }

        if(!this.apiClient.token){
            this.log("no token stored, registering a new node...")
            this.apiClient.registerNode(this.nodeType, nodePayload, this.onInit.bind(this));
        }

        else{
            this.apiClient.updateNode(this.nodeType, nodePayload, this.onInit.bind(this));
        }
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
                cb()
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

    log(msg, args) {
        if(!args){
            console.log(this.name + ": " + msg);
        }
        else{
            console.log(this.name + ": " + _.template(msg)(args))
        }
    }

    disconnect() {}

}

module.exports = BaseServer;
