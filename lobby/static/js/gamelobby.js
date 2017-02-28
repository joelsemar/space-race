'use strict';
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var socket;
var CURRENT_GAME;
$(function() {
    socket = io.connect('http://127.0.0.1:7001');
    $.get("/game", function(game) {
        CURRENT_GAME = game;
        populatePlayerList();
        socket.emit("join_game_chat", game)
        $("#gameName").html(game.name);

    })
    socket.on("lobby_update", function(data) {
        data = JSON.parse(data);
        for (var i = 0; i < data.results.length; i++) {
            if (data.results[i].id === CURRENT_GAME.id) {
                CURRENT_GAME = data.results[i];
                break;
            }
        }
        populatePlayerList();
    });
    socket.on("message", function(data) {
        console.log(data);
    })
})


function populatePlayerList() {
    var template = _.template("<tr><td>{{nickname}}</td><td>{{ready}}</td></tr>")
    var html = "";
    _.each(CURRENT_GAME.players, function(player) {
        var ready_icon = '<span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>'
        var unready_icon = '<span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span>'
        html += template({
            nickname: player.nickname,
            ready: player.ready ? ready_icon : unready_icon,

        })
    });
    console.log(html);
    $("#gametable").html(html);

}


function toggleReady() {
    var url = "/game/" + CURRENT_GAME.id + "/player/";
    $.ajax({
        url: url,
        type: "PUT",
        success: function(data) {
            CURRENT_GAME = data;
            populatePlayerList();
        }
    })
}

function leaveGame() {
    var url = "/game/" + CURRENT_GAME.id + "/player/";
    $.ajax({
        url: url,
        type: "DELETE",
        complete: function(data) {
            window.location.href = "/";
        }
    })

}
