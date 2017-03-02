/*jslint node: true */
"use strict";
var RUNNING_ON_CLIENT = true;

var Game = BaseGame.extend({

    fps: 24,
    players: [],
    debug: false,
    running: false,
    client: true,
    setup: function(player) {

        this.entityManager = new EntityManager();
        this.viewport = new ViewPort();
        this.miniMap = new MiniMap();
        this.drawLoop = new DrawLoop();
        this.socket = io.connect(player.node);
        this.currentPlayerId = player.id;

        console.log("Registering with token: " + player.token)
        this.socket.emit('register', {
            'tok': player.token,
            'id': player.id
        });
        new ScoreBoard();

        this.socket.on('gameStart', (data) => {
            data.token = player.token;
            this.players.push(new Player(data));
            this.start();
        });

        this.socket.on('serverUpdate', (data) => {
            this.receiveServerUpdate(data);
        });

        this.socket.on("tokenFail", (data) => {
            console.log(data);
        });

        $(document.body).keypress((e) => {
            if (e.shiftKey) {
                this.scrollLock = true;
            }
        });

        $(document.body).keyup((e) => {
            if (e.shiftKey) {
                this.scrollLock = false;
            }

        })
    },

    start: function() {
        console.log('starting game');
        this.viewport.bindEvents();
        this.drawLoop.run();
        this.running = true;
        this.run()
    },

    sendAttackSignal: function(target) {
        this.socket.emit('attack', {
            p: this.currentPlayerId,
            t: target.id,
            i: this.getCurrentPlayer().selectedIslandIds(),
            tok: this.getCurrentPlayer().token,
        });
    },

    getCurrentPlayer: function() {
        return this.entityManager.entityById(this.currentPlayerId);
    },

    receiveServerUpdate: function(data) {
        this.islands = [];
        _.each(data.islands || [], (island) => {
            var localIsland = this.entityManager.entityById(island.id);
            if (localIsland) {
                localIsland.loadFromData(island);
            } else {
                new Island(island);
            }
        });

        if (data.players) {

            _.each(data.players, (player) => {
                var clientPlayer = this.entityManager.entityById(player.id);
                if (clientPlayer) {
                    clientPlayer.resourcesGathered = player.resourcesGathered;
                } else {
                    this.players.push(new Player(player));
                }
            });
        }

        if (data.ships) {
            _.each(data.ships, (ship) => {

                var localShip = this.entityManager.entityById(ship.id);
                if (localShip) {
                    localShip.loadFromData(ship);
                } else {
                    new Ship(ship);
                }
            })
            var localShips = this.entityManager.entitiesByType('ship');
            var remoteShipIds = _.pluck(data.ships, 'id');

            // make sure we dont keep around any ships the server has removed
            _.each(localShips, (localShip) => {
                if (!_.contains(remoteShipIds, localShip.id)) {
                    this.entityManager.removeEntity(localShip.id);
                }
            });
        }
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
        var game = getGame();
        game.viewport.clear();
        game.entityManager.drawEntities();
        requestAnimationFrame(this.draw.bind(this));
    }

});
var getGame;

$(function() {
    $.ajax({
        url: "player",
        success: function(player) {
            var game = new Game();

            getGame = function() {
                return game;
            }

            game.setup(player);
            game.run();
        },

        error: function(err) {
            window.location.href = "/";
        }
    });
});
