import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from "material-ui/Dialog"
import TextField from "material-ui/TextField"
import close_button_img from "../img/btn-cancel.svg";

class GameDialog extends Component {
    constructor(props){
        super(props);
        if(props.game){
            this.state = {
                name: props.game.name,
                numPlayers: props.game.num_players,
                numBots: props.game.num_bots

            }
        } else {
            this.state = {
                name: '',
                numPlayers: 2,
                numBots: 0
            }
        }
    }

    onFieldChanged = (fieldName, event, val) => {
        this.setState({[fieldName]: val });
    }

    onSubmit = () => {
        this.props.onSubmit({
            name: this.state.name,
            num_bots: this.state.numBots,
            num_players: this.state.numPlayers
        });

        this.props.onDismiss();
    }

    buildTextField(fieldName, label){
        return (<TextField onChange={this.onFieldChanged.bind(null, fieldName)} value={this.state[fieldName]} floatingLabelText={label} id={"game-"+fieldName}></TextField>)

    }

    render (){
        return (
            <Dialog modal={true} open={this.props.open}>
                <div className="container center">
                    <div className="container vertical">
                        <div className="container">
                            <div className="sectionHeader">Game Settings</div>
                            <div className="container horizontal horizontal-reverse vertical-center flex1">
                                <img className="dialogClose" src={close_button_img} onClick={this.props.onDismiss}/>
                            </div>
                        </div>
                        {this.buildTextField("name", "Name")}
                        {this.buildTextField("numPlayers", "Players")}
                        {this.buildTextField("numBots", "Bots")}
                      <RaisedButton onTouchTap={this.onSubmit} label="Submit" primary={true}/>
                    </div>
                </div>
            </Dialog>
        )

    }
}


export default GameDialog
