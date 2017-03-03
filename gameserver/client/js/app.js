'use strict';
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var socket;
var CURRENT_PLAYER;

$(function() {
    var authSuccess = (player) => {
        CURRENT_PLAYER = player;
        $("#nicknameTitle").html("Hello, " + player.nickname);
        $.get("game", function(game) {
            window.location.href = "/gamelobby"
        })
        begin();
    }

    var authError = () => {
        $("#nicknameModal").modal('show');
        $("#nicknameModal").on('shown.bs.modal', function() {
            $("#nicknameInput").focus();

        });
        $("#nicknameInput").keypress(function(e) {
            if (e.which == 13) {
                $(this).blur();
                $("#nicknameSubmit").click();
            }
        });
        $("#nicknameSubmit").click(() => {
            $("#nicknameModal").modal('hide');
            var nickname = $("#nicknameInput").val();
            if (!nickname) {
                return;
            }
            $.ajax({
                url: "player",
                success: authSuccess,
                error: authError,
                data: JSON.stringify({
                    nickname: nickname
                }),
                contentType: "application/json",
                method: "POST"
            });
        })
    }
    $.ajax({
        url: "player",
        success: authSuccess,
        error: authError,
    });
});

function begin() {

    $.get("/games", function(body) {
        populateGamesTable(body)
    });

    socket = io.connect(CURRENT_PLAYER.chatnode);
    socket.on("serverUpdate", function(data) {
        populateGamesTable(data);
    });
    socket.on("reconnect", console.log("reconnected"))

    // subscribe to the lobby updates
    socket.emit("subscribe", {
        tok: CURRENT_PLAYER.token
    })
    $('#gameName').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            createGame();
        }
    });
    bindChatUi("#chatLogInner", "#chatInput", "#chatSend");
    joinChat("main");
}

function populateGamesTable(data) {
    var template = _.template("<tr><td>{{name}}</td><td>{{players}}</td><td>{{state}}</td><td><button onclick='joinGame({{id}})'>Join</button></td></tr>")
    var html = "";
    _.each(data.results, function(item) {
        var players = item.players.length + "/" + item.num_players
        html += template({
            name: item.name,
            state: item.state,
            players: players,
            id: item.id
        })
    })
    $("#gametable").html(html);
}

function joinGame(id) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/game/" + id + "/player",
        success: function(data) {
            window.location.href = "gamelobby";
        }

    })
}

function createGame() {
    var gameName = $("#gameName").val();
    if (!gameName) {
        alert("Please provide a name for your game");
        return;
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            "name": gameName,
            "num_players": 2
        }),
        url: "/game/",
        success: function() {
            window.location.href = "gamelobby";
        }
    })
}
