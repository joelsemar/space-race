'use strict';
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var chatLineTemplate = _.template("<div><b>{{sender}}</b>: {{message}}</div>")
var socket;
var CURRENT_GAME;
var CURRENT_PLAYER;
$(function() {
    socket = io.connect('http://127.0.0.1:7001');
    $.get("/game", function(game) {
        CURRENT_GAME = game;
        populatePlayerList();
        socket.emit("join_game_chat", game)
        $("#gameName").html(game.name);

    })

    $.get("/player", function(player) {
        CURRENT_PLAYER = player;
        if (player.creator) {
            $("#goButton").show();
        }
    });

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
        var line = "<span><b>"
        $("#chatLogInner").append(chatLineTemplate(data));
        console.log(data);
        $("#chatLogInner").scrollTop($("#chatLogInner")[0].scrollHeight);

    })
    $('#chatInput').keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            sendChatMessage();
        }
    });
})


function populatePlayerList() {
    var template = _.template("<tr><td>{{nickname}}</td><td>{{ready}}</td></tr>")
    var html = "";
    var gameReady = true;
    _.each(CURRENT_GAME.players, function(player) {
        var readyIcon = '<span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span>'
        var unreadyIcon = '<span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span>'
        if (!player.ready) {
            gameReady = false;
        }
        html += template({
            nickname: player.nickname,
            ready: player.ready ? readyIcon : unreadyIcon,
        });
    });
    $("#gametable").html(html);
    if (!gameReady) {
        $("#goButton").addClass("disabled");
    } else {
        $("#goButton").removeClass("disabled");

    }


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

function sendChatMessage() {
    var chatInput = $("#chatInput");
    var msg = chatInput.val();
    if (!msg.length || !CURRENT_GAME || !CURRENT_PLAYER) {
        return;
    }
    var payload = {
        gameId: CURRENT_GAME.id,
        playerToken: CURRENT_PLAYER.token,
        message: msg
    }
    socket.emit("message", payload);
    chatInput.val('');
    chatInput.focus();

}
