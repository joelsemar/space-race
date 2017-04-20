import React, { Component } from 'react';
import logo from '../img/logo.svg';

import api from "../api.js";
import '../css/App.css';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from "material-ui/Dialog"
import TextField from "material-ui/TextField"
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import Chat from './chat';
import GameDialog from "./gamedialog"
import GameLobby from "./gamelobby"


class Lobby extends Component {
    constructor(props){
        super(props);
        this.state = {
            showCreateGameDialog: false
        }
    }



    onJoinGame = (gameId) => {
        api.joinGame(gameId, this.props.onGameJoined);
    }

    onGameDialogSubmit = (gameData) => {
        api.createGame(gameData, this.props.onGameJoined)
    }


    toggleCreateGameDialog = () => {
        this.setState(prevState => {
            return {showCreateGameDialog: !prevState.showCreateGameDialog}
        });
    }

    render() {
        return (
            <div className="container vertical  flex1" >
                    <div className="sectionHeader">
                        Current Games
                    </div>
                    <GamesTable onJoinGame={this.onJoinGame} games={this.props.games}/>
                    <div>
                        <RaisedButton label="Create Game" primary={true} fullWidth={false} onTouchTap={this.toggleCreateGameDialog}></RaisedButton>
                    </div>
                    <div className="container vertical flex1">
                    <div className="sectionHeader">
                        Chat
                    </div>
                        <Chat player={this.props.player} room="main"/>
                    </div>
                    <GameDialog open={this.state.showCreateGameDialog} onSubmit={this.onGameDialogSubmit} onDismiss={this.toggleCreateGameDialog}/>
            </div>
        );
    }
}

var GamesTable = (props) => {
    if(!props.games.length){
        return (<div>No games.</div>)
    }
    return (
        <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false} >
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Players</TableHeaderColumn>
                  <TableHeaderColumn>Status</TableHeaderColumn>
                  <TableHeaderColumn></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                    {props.games.map(game =>{
                        var players = game.players.length + "/" + game.num_players
                        return (
                             <GameRow name={game.name} players={players} state={game.state} onJoinGame={props.onJoinGame.bind(null, game.id)}/>
                          )
                    })}
              </TableBody>
        </Table>

    )

}

var GameRow = (props) => {
    return (
        <TableRow>
          <TableRowColumn>{props.name}</TableRowColumn>
          <TableRowColumn>{props.players}</TableRowColumn>
          <TableRowColumn>{props.state}</TableRowColumn>
          <TableRowColumn>
              <RaisedButton onTouchTap={props.onJoinGame} primary={false}>Join</RaisedButton>
          </TableRowColumn>
        </TableRow>

    )

}

export default Lobby;
