'use strict';
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

$.ajax({
    url: "/games",
    success: function(resp) {
        populateGamesTable(resp);
    }

});

function populateGamesTable(data) {
    var template = _.template("<tr><td>{{name}}</td><td>{{players}}</td><td>{{state}}</td><td><button onclick='joinGame({{id}})'>Join</button></td></tr>")
    var html = "";
    _.each(data.results, function(item) {
        var names = _.map(item.players, function(i) {
            return i.nickname
        })
        var players = names.join(", ")
        html += template({
            name: item.name,
            state: item.state,
            players: players,
            id: item.id
        })
    })
    console.log(html);
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
        url: "/game/" + id + "/players"

    })
}
