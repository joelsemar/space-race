import _ from "underscore";

class DataStore {


    getPlayer() {
        return this.getObject("currentPlayer");
    }

    savePlayer(user) {
        this.setObject("currentPlayer", user);
    }

    clearPlayer() {
        this.set("currentPlayer", null);
    }


    setObject(key, obj) {
        this.set(key, JSON.stringify(obj));
    }

    getObject(key) {
        var ret = this.get(key);
        if (!ret) {
            return false;
        }
        return JSON.parse(ret);
    }

    set(key, value) {
        localStorage.setItem(key, value);
    }

    get(key) {
        return localStorage.getItem(key)
    }

    clear() {
        localStorage.clear();
    }

}

export default DataStore;
