/*jslint node: true */
"use strict";
var RUNNING_ON_CLIENT = true;

var World = BaseWorld.extend({

    fps: 24,
    islandImageSrc: 'img/luna.png',
    shipImageSrc: 'img/ship.png',
    players: [],
    init: function(id, players) {
        this._super(id, players);
        this.islandImage = new Image();
        this.islandImage.src = this.islandImageSrc;
        this.shipImage = new Image();
        this.shipImage.src = this.shipImageSrc;

    },

    receiveServerUpdate: function(data) {
        console.log("Received from server: " + JSON.stringify(data));
        this.islands = [];
        _.each(data.islands || [], function(island) {
            var localIsland = Game.entityManager.entityById(island.id);
            if (localIsland) {
                localIsland.loadFromData(island);
            } else {
                new Island(island);
            }
        }, this);

        if (data.players) {

            _.each(data.players, function(player) {
                var clientPlayer = Game.entityManager.entityById(player.id);
                if (clientPlayer) {
                    clientPlayer.resourcesGathered = player.resourcesGathered;
                } else {
                    this.players.push(new Player(player));
                }
            }, this);
        }

        if (data.ships) {
            _.each(data.ships, function(ship) {

                var localShip = Game.entityManager.entityById(ship.id);
                if (localShip) {
                    localShip.loadFromData(ship);
                } else {
                    new Ship(ship);
                }
            })
            var localShips = Game.entityManager.entitiesByType('ship');
            var remoteShipIds = _.pluck(data.ships, 'id');
            _.each(localShips, function(localShip) {
                if (!_.contains(remoteShipIds, localShip.id)) {
                    Game.entityManager.removeEntity(localShip.id);
                }
            });
        }
        //this.ships = data.ships;
        this.size = data.size;
        this.resetFrame();
    },

});


var DrawLoop = Class.extend({

    init: function() {
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
    },

    run: function() {
        requestAnimationFrame(this.draw.bind(this));
    },

    draw: function() {
        Game.viewport.clear();
        Game.entityManager.drawEntities();
        requestAnimationFrame(this.draw.bind(this));
    }

});



var Game = {

    debug: false,
    running: false,
    client: true,

    init: function() {
        //  $("#chat_form").show();
        var token = utils.parseQueryString()['token'];
        this.entityManager = new EntityManager();
        this.world = new World([]);
        this.viewport = new ViewPort();
        this.miniMap = new MiniMap();
        this.drawLoop = new DrawLoop();
        this.socket = io.connect();
        this.currentPlayerId = token;
        this.socket.emit('register', {
            'token': token
        });
        new ScoreBoard();

        this.socket.on('game_start', function(data) {
            Game.world.players.push(new Player(data));
            Game.start();
        });

        this.socket.on('world_update', function(data) {
            Game.world.receiveServerUpdate(data);
        });

        this.socket.on("token_fail", function(data) {
            console.log(data);
        });

        $(document.body).keypress(function(e) {
            if (e.shiftKey) {
                Game.scrollLock = true;
            }
        });

        $(document.body).keyup(function(e) {
            if (e.shiftKey) {
                Game.scrollLock = false;
            }

        })
    },

    start: function() {
        console.log('starting game');
        this.world.run();
        this.viewport.bindEvents();
        this.drawLoop.run();
        this.running = true;
    },

    sendAttackSignal: function(target) {
        this.socket.emit('attack_signal', {
            p: this.currentPlayerId,
            t: target.id,
            i: this.getCurrentPlayer().selectedIslandIds()
        });
    },

    getCurrentPlayer: function() {
        return this.entityManager.entityById(this.currentPlayerId);
    },

};
//Game.debug = true;

$(function() {
    Game.init();
});
