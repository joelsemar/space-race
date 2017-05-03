import React, { Component } from 'react';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import io from "socket.io-client"

import api from './api.js';
import DataStore from './datastore.js';
import Lobby from "./components/lobby";
import GameLobby from "./components/gamelobby"
import stars_bg from "./img/stars.png";

window.dataStore = new DataStore();
window.api = api;
const MAX_CONNECTION_FAILURES = 5;

const dataStore = new DataStore();

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            player: dataStore.getPlayer(),
            submittedNick: false,
            games: [],
            loading: true,
            currentGame: false,
            error: false,
            connectionErrors: 0
        }
    }

    componentWillMount(){
        this.fetchPlayer();
    }

    fetchPlayer(){
        api.getPlayer(player => {
            this.setUp(player);
        }, () => {
            this.setState({player: false})
            dataStore.clearPlayer();
        })

    }

    setUp(player) {
        var socket = io.connect(player.chatnode, () => {
            this.setState({error: false, connectionErrors: 0})
        });

        socket.io.on("connect_error", (err) => {
            this.setState(prevState => {
                return {error: "Unable to connect to the lobby: " + err,
                        connectionErrors: prevState.connectionErrors + 1}
            })
        })

        socket.io.on("connect", () => {
            this.setState({error: false, connectionErrors: 0})
        })

        socket.io.on("reconnect", () => {
            this.setState({error: false})
        })

        api.getGames((response) => {
            this.setState({games: response.results})
        });

        socket.emit("subscribe", { tok: player.token });
        socket.on("serverUpdate", this.onGamesUpdate)
        dataStore.savePlayer(player);
        this.setState({player: player,
                       socket: socket,
                       currentGame: player.game || false});

    }

    componentWillUnmount(){
        this.state.socket.disconnect();
    }

    onGamesUpdate = (data) => {
        this.setState({games: data})
        this.updateCurrentGame(data)
    }

    updateCurrentGame(games) {
        for(var game of games){
            if (game.id === this.state.currentGame.id){
                this.setState({currentGame: game});
                return;
            }
        }
        this.setState({currentGame: false})

    }

    onLogin = (player) => {
        this.setState({player: player});
        this.setUp(player);
    }

    onGameJoined = (game) => {
        this.setState({currentGame: game})
    }

    onGameLeft = (player) => {
        this.setState({player: player, currentGame: false})
    }

    onErrorDismissed = () => {
        this.setState({error: false})
    }

    componentDidUpdate(){
        if(this.state.currentGame && this.state.currentGame.node){
            console.log("opening game")
            window.location.href = this.state.currentGame.location
        }
        
        if(this.state.connectionErrors >= MAX_CONNECTION_FAILURES){
            this.setState({connectionErrors: 0, error: false})
            this.state.socket.io.disconnect();
            this.fetchPlayer();
        }

    }


    render() {
        let page;
        let title;
        if (this.state.player) {
            title = (<div className="sectionHeader">Wecome {this.state.player.nickname}</div>)
            if (this.state.currentGame) {
                page = <GameLobby player={this.state.player} game={this.state.currentGame} onGameLeft={this.onGameLeft}/>
            } else {
                page = <Lobby player={this.state.player} games={this.state.games} onGameJoined={this.onGameJoined} />
            }
        }

        return (
            <div className="App">
               <div className="App-header" style={{backgroundImage: "url(" + stars_bg + ")"}}>
                  <div className="mainHeader">Space Race</div>
                </div>

                <div className="container horizontal center" style={{height: "100%", padding: "40px"}}>
                    <div className="container vertical flex1">
                        {title}
                        {page}

                    </div>
                    <LoginDialog onLogin={this.onLogin} open={!this.state.player}/>
                </div>
                <ErrorDialog open={this.state.error != false} message={this.state.error} onErrorDismissed={this.onErrorDismissed}/>
            </div>
        )
    }
}

class LoginDialog extends Component {
    constructor (props) {
        super(props);
        this.state = {
            submittedNick: ''
        }

    }
    onNicknameEnter = (event, val) => {
        this.setState({submittedNick: val})
    }

    onNicknameSubmit = () => {
        if(!this.state.submittedNick.length){
            return;
        }
        api.createPlayer(this.state.submittedNick, player => {
            dataStore.savePlayer(player);
            this.props.onLogin(player)
        })
    }

    onKeyPress = (event) => {
      if (event.charCode === 13) { // enter key pressed
        event.preventDefault();
        this.onNicknameSubmit();
      }
    }

    render ( ) {
        return (
            <Dialog open={this.props.open} title="Enter a nickname">

             <div className="container vertical-center">
                      <div className="flex1">
                          <TextField onChange={this.onNicknameEnter} placeholder="Nickname" onKeyPress={this.onKeyPress} name="nickname"></TextField>
                      </div>
                      <div className="flex1 container horizontal-reverse">
                          <RaisedButton  fullWidth={false} onTouchTap={this.onNicknameSubmit} label="Submit"/>
                      </div>
             </div>
            </Dialog>

        )

    }

}

var ErrorDialog = (props) => {
    return (
        <Dialog open={props.open} title="Server Error">
            {props.message}
            <RaisedButton  fullWidth={false} onTouchTap={props.onErrorDismissed} label="Dismiss"/>
        </Dialog>
    )


}

export default App;
