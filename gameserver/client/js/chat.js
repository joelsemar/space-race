var chatLineTemplate = _.template("<div><b>{{s}}</b>: {{m}}</div>")

function joinChat(room) {
    socket.emit("joinChat", {
        tok: CURRENT_PLAYER.token,
        r: room
    })
}

function bindChatUi(chatLogBody, chatInput, submitButton) {
    socket.on("message", function(data) {
        $(chatLogBody).append(chatLineTemplate(data));
        $(chatLogBody).scrollTop($(chatLogBody)[0].scrollHeight);

    })

    $(chatInput).keypress(function(e) {
        if (e.which == 13) {
            $(this).blur();
            sendChatMessage(this);
        }
    });

    $(submitButton).click(function() {
        sendChatMessage($(chatInput));
    })

}

function sendChatMessage(chatInput) {
    chatInput = $(chatInput)
    var msg = $(chatInput).val();
    if (!msg.length || !CURRENT_PLAYER) {
        return;
    }

    var payload = {
        tok: CURRENT_PLAYER.token,
        m: msg
    }

    socket.emit("message", payload);
    chatInput.val('');
    chatInput.focus();
}
