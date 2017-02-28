var request = require("request"),
    Class = require("../shared/lib/class.js");


var ApiClient = Class.extend({
    init: function(api_server, token) {
        this.api_server = api_server || "http://127.0.0.1:8000";
        if (!token) {
            this.registerNode(this.getCurrentNodeInfo.bind(this));
        } else {
            this.token = token;
        }
    },

    getCurrentNodeInfo: function(success, error) {
        debugger;

        var retry = this.getCurrentNodeInfo.bind(this);

        function callback(err) {
            console.log(err);
            setTimeout(retry, 3000);
        }

        this.get("node", success, callback);
    },

    registerNode: function(success) {
        var payload = {
            host: "127.0.0.1",
            port: "8001"
        }

        function callback(body) {
            console.log("Successfully registered node. with token: " + body.token);
            console.log(body)
            this.token = body.token;
            success();
        }
        this.post("node", payload, callback.bind(this));
    },

    get: function(endpoint, success, error) {
        this.call(endpoint, "get", {}, success, error);
    },

    post: function(endpoint, payload, success, error) {
        this.call(endpoint, "post", payload, success, error);
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
            url: this.api_server + "/" + endpoint,
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
    }
})

module.exports = ApiClient;
