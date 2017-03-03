var request = require("request"),
    fs = require('fs'),
    Class = require("../shared/lib/class.js");


DEFAULT_TOKEN_FILE = "./token"

try {
    token = fs.readFileSync(TOKEN_CACHE);
} catch (e) {
    token = null;
}


var ApiClient = Class.extend({
    init: function(apiServer, tokenFile) {
        this.apiServer = apiServer;
        this.tokenFile = tokenFile || DEFAULT_TOKEN_FILE;
        this.getToken();
    },

    getCurrentNodeInfo: function(success, error) {
        var retry = () => {
            this.getCurrentNodeInfo(success, error);
        }

        function callback(err) {
            console.log(err);
            setTimeout(retry, 3000);
        }

        this.get("node", success, callback);
    },

    getChatNodeInfo: function(success, error) {
        this.get("chatnode", success, error);
    },

    registerNode: function(payload, success, endpoint) {
        endpoint = endpoint || "node";
        success = success || function() {};

        var callback = (body) => {
            console.log("Successfully registered node. with token: " + body.token);
            this.storeToken(body.token);
            success();
        }
        this.post(endpoint, payload, callback);
    },

    updateNode: function(payload) {
        this.put("node", payload)
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
        var defaultErrback = function(out) {
            console.log(out);
        }
        var defaultCallback = function(out) {
            console.log(out);

        }
        success = success || defaultCallback;
        error = error || defaultErrback;
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
        console.log("calling " + method + "/" + endpoint)
        request[method](options, (err, response, body) => {
            if (!response) {
                console.log("Null response returned: " + err + ", " + respnse + ", " + body)
                return;
            }
            if (err || response.statusCode > 399) {
                if (response.statusCode === 401) {
                    this.wipeToken();
                }
                error(body);
            } else {
                success(body);
            }
        });
    },

    getToken: function() {
        try {
            token = fs.readFileSync(this.tokenFile);
            console.log("read from token file: " + token);
            if (token != null && token.length > 0) {
                this.token = token;
            } else {
                this.token = null;
            }
        } catch (e) {
            console.log("Error reading token file: " + this.tokenFile)
            console.log(e);
            return;
        }
    },

    storeToken: function(token) {
        console.log("Storing token: " + token);
        this.token = token;
        try {
            fs.writeFile(this.tokenFile, token, function() {});
        } catch (e) {
            console.log("Error writing token file: " + this.tokenFile)
            console.log(e);
            return;

        }

    },

    wipeToken: function() {
        this.token = null;
        fs.writeFile(this.tokenFile, '', function() {});
    }

})

module.exports = ApiClient;
