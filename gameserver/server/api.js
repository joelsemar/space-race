var request = require("request"),
    fs = require('fs');


DEFAULT_TOKEN_FILE = "./token"
let token;

try {
    token = fs.readFileSync(TOKEN_CACHE);
} catch (e) {
    token = null;
}


class ApiClient {

    constructor(apiServer, tokenFile){
        this.apiServer = apiServer;
        this.tokenFile = tokenFile || DEFAULT_TOKEN_FILE;
        this.getToken();
    }

    getCurrentNodeInfo(success, error) {
        this.get("node", success, error);
    }

    getChatNodeInfo(success, error) {
        this.get("chatnode", success, error);
    }

    registerNode(endpoint, payload, success, error) {
        endpoint = endpoint || "node";
        success = success || function() {};

        var callback = (body) => {
            this.storeToken(body.token);
            success();
        }
        this.post(endpoint, payload, callback, error);
    }

    updateNode(endpoint, payload, success, error) {
        this.put(endpoint, payload, success, error)
    }

    getGames(success) {
        this.get("games", success);
    }

    getPlayerForToken(token, success) {
        this.get("player?token=" + token, success);
    }

    get(endpoint, success, error) {
        this.call(endpoint, "get", {}, success, error);
    }

    post(endpoint, payload, success, error) {
        this.call(endpoint, "post", payload, success, error);
    }

    put(endpoint, payload, success, error) {
        this.call(endpoint, "put", payload, success, error);
    }

    call(endpoint, method, payload, success, error) {

        var defaultErrback = (out) => {
            if(out){
                console.log(out);
            }
        }

        var defaultCallback = (out) => {
            if(out){
                console.log(out);
            }
        }

        var headers = {};

        success = success || defaultCallback;
        error = error || defaultErrback;
        payload = payload || {};

        if (this.token) {
            headers["X-NODE-TOKEN"] = this.token;
        }

        var options = {
            url: this.apiServer + "/" + endpoint,
            headers: headers,
            json: payload
        }

        console.log("calling " + method.toUpperCase() + " /" + endpoint + " with: " + JSON.stringify(payload))
        request[method](options, (err, response, body) => {
            if (!response) {
                console.log("Null response returned: " + err + ", " + response + ", " + body)
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
    }

    getToken() {
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
            this.token = null;
            return;
        }
    }

    storeToken(token) {
        console.log("Storing token: " + token);
        this.token = token;
        try {
            fs.writeFile(this.tokenFile, token, function() {});
        } catch (e) {
            console.log("Error writing token file: " + this.tokenFile)
            console.log(e);
            return;
        }
    }

    wipeToken() {
        this.token = null;
        fs.writeFile(this.tokenFile, '', function() {});
    }

}

module.exports = ApiClient;
