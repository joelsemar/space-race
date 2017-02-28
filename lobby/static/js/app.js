'use strict';
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var socket;
$(function() {
    $.get("/games", function(body) {
        populateGamesTable(body)

    })
    socket = io.connect('http://127.0.0.1:7001');
    socket.on("lobby_update", function(data) {
        populateGamesTable(JSON.parse(data));
    });
})

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
    var nickname = $("#nickname").val();
    if (!nickname) {
        alert("Please provide a nickname");
        return;
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            "nickname": nickname
        }),
        url: "/game/" + id + "/player",
        success: function(data) {
            window.location.href = "gamelobby";
        }

    })
}

function createGame() {
    var gameName = $("#gameName").val();
    var nickname = $("#nickname").val();
    if (!gameName) {
        alert("Please provide a name for your game");
        return;
    }
    if (!nickname) {
        alert("Please provide a nickname");
        return;
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            "nickname": nickname,
            "name": gameName,
            "num_players": 2
        }),
        url: "/game/"
    })

}
