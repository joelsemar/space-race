import React, { Component } from 'react';
import logo from '../img/logo.svg';

import api from "../api.js";
import '../css/App.css';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from "material-ui/Dialog"
import TextField from "material-ui/TextField"
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import Chat from './chat';
import GameDialog from './gamedialog'
import close_button_img from "../img/btn-cancel.svg";

class GameLobby extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showSettingsDialog: false
        }
    }

    toggleReady = () => {
        api.toggleReady(this.props.game.id);
    }

    leaveGame = () => {
        api.leaveGame(this.props.game.id, this.props.onGameLeft);

    }

    startGame = () => {
        api.startGame();
    }

    toggleSettingsDialog = () =>{
        this.setState(prevState => {
            return {showSettingsDialog: !prevState.showSettingsDialog}
        })

    }

    onSettingsDialogSubmit = (gameData) => {
        api.updateGame(gameData, this.props.onGameJoined)
    }

    getEmptySlots () {
        var ret = [];
        for(var i=0;i<(this.props.game.num_players - this.props.game.players.length);i++){
            ret.push({label: "Waiting for player"})
        }
        return ret;

    }

    showAdmin(){
        return this.props.player.id === this.props.game.creator_id;
    }

    render(){
        let adminPanel;
        let botLabel;
        if(this.showAdmin()){
            adminPanel = (<AdminPanel game={this.props.game} startGame={this.startGame} toggleSettingsDialog={this.toggleSettingsDialog}/>)
        }
        if(this.props.game.num_bots){
            botLabel = (<p>{this.props.game.num_bots} bots</p>)
        }
        return (

            <div className="container vertical flex1" >
                <div className="sectionHeader">{this.props.game.name}</div>
                <PlayerTable players={this.props.game.players} toggleReady={this.toggleReady} currentPlayerId={this.props.player.id} onLeave={this.leaveGame} emptySlots={this.getEmptySlots()}/>
                <div className="container vertical">
                    {botLabel}
                </div>
                <Chat player={this.props.player} room={"game-" + this.props.game.id}/>
                {adminPanel}
                <GameDialog game={this.props.game} open={this.state.showSettingsDialog} onSubmit={this.onSettingsDialogSubmit} onDismiss={this.toggleSettingsDialog}/>
            </div>
        )
    }

}

var AdminPanel = (props) => {
    let playersReady = props.game.players.length === props.game.num_players;
    for (var player of props.game.players ){
        if(!player.ready){
            playersReady = false;
        }
    }
    return (
        <div className="flex1">
            <div className="sectionHeader">Admin</div>
            <RaisedButton onTouchTap={props.toggleSettingsDialog} label="Settings" primary={true}/>
            <RaisedButton onTouchTap={props.startGame} label="Start" primary={true} disabled={!playersReady} style={{marginLeft: "20px"}}/>
        </div>

    )

}

var PlayerTable = (props) =>{
    return (
        <Table>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false} >
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Ready</TableHeaderColumn>
                  <TableHeaderColumn></TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}  >
                    {props.players.map(player =>{
                        return (<PlayerRow {...props} player={player} key={"player-" + player.id}/>)
                    })}
                    {props.emptySlots.map(slot => {
                        return (
                            <TableRow>
                              <TableRowColumn><div style={{fontStyle: "italic"}}>{slot.label}</div></TableRowColumn>
                              <TableRowColumn><i className="material-icons">hourglass_empty</i></TableRowColumn>
                              <TableRowColumn></TableRowColumn>
                            </TableRow>)

                    })}
              </TableBody>
        </Table>
    )
}

var PlayerRow = (props) => {
    let iconClass = "material-icons unclickable";
    let leaveButton;
    if(props.player.id == props.currentPlayerId){
        iconClass = "material-icons clickable";
        leaveButton = (<RaisedButton onTouchTap={props.onLeave} label="Leave Game" primary={true}/>)
    }
    let icon = (<i className={iconClass} onTouchTap={props.toggleReady}>check_box_outline_blank</i>);

    if(props.player.ready){
        icon = (<i className={iconClass} onTouchTap={props.toggleReady}>check_box</i>);
    }
    return (
            <TableRow id={"player-" + props.player.id}>
              <TableRowColumn>{props.player.nickname}</TableRowColumn>
              <TableRowColumn>{icon}</TableRowColumn>
              <TableRowColumn>{leaveButton}</TableRowColumn>
            </TableRow>

    )


}

export default GameLobby;
