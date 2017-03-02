var request = require("request"),
    fs = require('fs'),
    Class = require("../shared/lib/class.js");


TOKEN_CACHE = "./token"

try {
    token = fs.readFileSync(TOKEN_CACHE);
} catch (e) {
    token = null;
}


var ApiClient = Class.extend({
    init: function(apiServer) {
        this.apiServer = apiServer;
        this.getToken();

    },

    getCurrentNodeInfo: function(success, error) {
        var retry = this.getCurrentNodeInfo.bind(this);

        function callback(err) {
            console.log(err);
            setTimeout(retry, 3000);
        }

        this.get("node", success, callback);
    },

    updateNode: function(payload) {
        this.put("node", payload)
    },

    registerNode: function(payload, success) {
        function callback(body) {
            console.log("Successfully registered node. with token: " + body.token);
            console.log(body)
            this.token = body.token;
            this.storeToken(body.token);
            success();
        }
        this.post("node", payload, callback.bind(this));
    },

    getGames: function(success) {
        this.get("games", success);
    },

    getPlayerForToken: function(token, success) {
        this.get("player?token=" + token, success);
    },

    get: function(endpoint, success, error) {
        this.call(endpoint, "get", {}, success, error);
    },

    post: function(endpoint, payload, success, error) {
        this.call(endpoint, "post", payload, success, error);
    },

    put: function(endpoint, payload, success, error) {
        this.call(endpoint, "put", payload, success, error);
    },

    call: function(endpoint, method, payload, success, error) {
        var defaultCallback = function(out) {
            console.log(out);
        }
        success = success || defaultCallback;
        error = error || defaultCallback;
        payload = payload || {};
        headers = {};
        if (this.token) {
            headers["X-NODE-TOKEN"] = this.token;
        }

        var options = {
            url: this.apiServer + "/" + endpoint,
            headers: headers,
            json: payload
        }
        request[method](options, function(err, response, body) {
            if (err || response.statusCode > 399) {
                error(body);
            } else {
                success(body);
            }
        });
    },

    getToken: function() {
        try {
            this.token = fs.readFileSync(TOKEN_CACHE);
        } catch (e) {
            return;
        }
    },

    storeToken: function(token) {
        fs.writeFile(TOKEN_CACHE, token, function() {});
    }

})

module.exports = ApiClient;
