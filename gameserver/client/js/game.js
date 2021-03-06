/*jslint node: true */
"use strict";
var RUNNING_ON_CLIENT = true;

var Game = BaseGame.extend({

    fps: 24,
    players: [],
    debug: false,
    running: false,
    client: true,
    seenMap: {},
    setup: function (player) {

        this.entityManager = new EntityManager();
        this.viewport = new ViewPort();
        this.miniMap = new MiniMap();
        this.drawLoop = new DrawLoop();
        this.fog = new Fog();
        this.fullFog = new FullFog();
        this.miniMapFog = new MiniMapFog();
        this.miniMapFullFog = new MiniMapFullFog();

        this.socket = io.connect(player.game.node);
        this.currentPlayerId = player.id;

        console.log("Registering with token: " + player.token);
        this.socket.emit('register', {
            'tok': player.token,
            'id': player.id
        });
        new ScoreBoard();

        this.socket.on('gameStart', (data) => {
            data.token = player.token;
            var currentPlayer = new Player(data);
            currentPlayer.onSelect = () => onSelectSound.play();
            currentPlayer.onAttack = () => onLaunchSound.play();
            currentPlayer.onShipLand = () => shipLandSound.play();
            this.players.push(currentPlayer);
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

    step: function () {
        this._super();
        var currentPlayer = this.getCurrentPlayer();

        if (!currentPlayer.alive && !this.spectate) {
            this.gameOver();
        } else {
            var alivePlayers = this.entityManager.entitiesWhere({
                type: "player",
                alive: true
            });
            if (this.players.length > 1 && alivePlayers.length === 1 && currentPlayer.alive) {
                this.win();
            }

        }
    },

    start: function () {
        console.log('starting game');
        this.viewport.bindEvents();
        this.drawLoop.run();
        this.run()
    },

    sendAttackSignal: function (target) {
        this.socket.emit('attack', {
            p: this.currentPlayerId,
            t: target.id,
            i: this.getCurrentPlayer().selectedIslandIds(),
            tok: this.getCurrentPlayer().token,
        });
    },

    getCurrentPlayer: function () {
        return this.entityManager.entityById(this.currentPlayerId);
    },

    receiveServerUpdate: function (data) {
        if (data.players) {
            _.each(data.players, (player) => {
                var clientPlayer = this.entityManager.entityById(player.id);
                if (clientPlayer) {
                    clientPlayer.loadFromData(player);
                } else {
                    this.players.push(new Player(player));
                }
            });
        }
        _.each(data.islands || [], (island) => {
            var localIsland = this.entityManager.entityById(island.id);
            if (localIsland) {
                localIsland.loadFromData(island);
            } else {
                new Island(island);
            }
        });


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
        if (data.seenMap && _.isEmpty(this.seenMap)) {
            this.seenMap = data.seenMap[this.currentPlayerId];
        }

        if (data.visibleSectorMap) {
            this.visibleSectorMap = data.visibleSectorMap;
        }

        this.size = data.size;
        this.resetFrame();
    },

    win: function () {
        $("#gameOverBody").html("Nicely Done!")
        $("#gameOverModalTitle").html("You Win!")
        $("#gameOverModal").modal();
        $("#gameOverExit").click(() => {
            this.exit();
        })

        $("#gameOverKeepWatching").click(() => {
            this.spectate = true;
            $("#gameOverModal").modal('hide');
        })

    },



    gameOver: function () {
        $("#gameOverBody").html("Ouch :(")
        $("#gameOverModalTitle").html("You Lose")
        $("#gameOverModal").modal();
        $("#gameOverExit").click(() => {
            this.exit();
        })
        $("#gameOverKeepWatching").click(() => {
            this.spectate = true;
            $("#gameOverModal").modal('hide');
        })
    },

    exit: function () {
        console.log("exiting");
        $.ajax({
            type: "POST",
            url: "/api/player/reset",
            success: function (player) {
                document.location.href = player.lobby_location;
            },
        })
    },

    markSeen: function (playerId, sector) {
        if (playerId === this.currentPlayerId) {
            this.seenMap[sector] = true;
        }
    },

});


var DrawLoop = Class.extend({

    init: function () {
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
    },

    run: function () {
        requestAnimationFrame(this.draw.bind(this));
    },

    draw: function () {
        var game = getGame();
        game.viewport.clear();
        game.entityManager.drawEntities();
        requestAnimationFrame(this.draw.bind(this));
    }

});
var getGame;

$(function () {
    $.ajax({
        url: "/api/player",
        success: function (player) {
            if (!player.game) {
                window.location.href = player.lobby_location;
            }
            var game = new Game();

            getGame = function () {
                return game;
            }

            game.setup(player);
        },

        error: function (err) {
            debugger;
            window.location.href = '/';
        }
    });
});
