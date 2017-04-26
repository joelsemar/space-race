import xhr from "xhr";
import DataStore from "./datastore"
const dataStore = new DataStore();

class Api {


    getPlayer(success, error) {
        this.get("player", success, error)
    }

    resetPlayer(nickname, success, error){
        let data = {nickname: nickname};
        this.post("player/reset", data,  success, error)
    }

    getGames(success, error){
        this.get("games", success, error);
    }


    createGame(game, success, error){
        this.post("game", game, success, error);
    }

    updateGame(game, success, error){
        this.put("game", game, success, error);
    }

    joinGame(gameId, success, error){
        this.post("game/" + gameId  + "/player", {}, success, error);
    }

    leaveGame(gameId, success, error){
        this.delete("game/" + gameId  + "/player", success, error);
    }

    startGame(success, error){
        this.put("game", {ready: true}, success, error);
    }

    createPlayer(nickname, success, error){
        this.post("player", {nickname: nickname}, success, error);
    }

    toggleReady(gameId, success, error){
        this.put("game/" + gameId + "/player", {}, success, error);
    }

    logout(success, error) {
        this.get("logout", () => {
            dataStore.clearPlayer();
            success()
        },
        error);
    }


    post(path, data, success, error){
        this.call(path, "POST", data, success, error);
    }

    get(path, success, error){
        this.call(path, "GET", {}, success, error);
    }

    put(path, data, success, error){
        this.call(path, "PUT", data, success, error);
    }

    delete(path, success, error){
        this.call(path, "DELETE", {}, success, error);
    }

    call(path, method, data, success, error) {
        success = success || (() => {});
        error = error || (() => {});
        method = method || "GET";
        data = data || {};

        xhr({
            body: JSON.stringify(data),
            method: method,
            uri: "/api/" + path,
            headers: {
                "Content-Type": "application/json"
            }
        }, function (err, resp, body) {

            if (resp.statusCode < 400) {
                body = JSON.parse(body);
                success(body);
            } else {
                error(err);
            }
        })

    }

}

export default new Api();
