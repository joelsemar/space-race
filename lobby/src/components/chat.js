import React, { Component } from 'react';
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

import io from "socket.io-client"


class Chat extends Component {

    constructor (props) {
        super(props);
        this.state = {
            enteredText: '',
            messages: [],
            players: [],
            socket: false
        }

    }
    log (msg){
        console.log("Chat: " + msg);

    }

    componentDidUpdate(){
        if(!this.state.socket){
            this.connect();
        }

    }

    componentWillReceiveProps(nextProps){
        if(this.props.player.chatnode != nextProps.player.chatnode){
            this.log("Got new chat node destination: " + nextProps.player.chatnode + " attempting to reconnect")
            if(this.state.socket){
                this.state.socket.disconnect();
                this.setState({socket: false})

            }
        }

    }

    componentWillUnmount(){
        this.state.socket.disconnect();
    }

    connect(){
        this.log("attempting to connect to: " + this.props.player.chatnode)
        var socket = io.connect(this.props.player.chatnode);
        this.setState({ socket: socket }, this.onSocketConnected);
    }

    onSocketConnected = () => {
        this.state.socket.on('message', this.onMessageReceived);
        this.state.socket.on('playerList', this.onPlayerListReceived);
        this.joinRoom(this.props.room);
    }

    onTextEnter = (event, val) => {
        this.setState({enteredText: val});
    }

    onKeyPress = (event) => {
      if (event.charCode === 13) { // enter key pressed
          event.preventDefault();
          this.onChatSubmit();
      }
    }

    onChatSubmit = () => {
        if(!this.state.enteredText.length){
            return;
        }

        var payload = {
            tok: this.props.player.token,
            m: this.state.enteredText
        }

        this.log("Sending: " + JSON.stringify(payload))

        this.state.socket.emit("message", payload);
        this.setState({enteredText: ''})
        this.textInput.focus();

    }

    onMessageReceived = (message) => {
        this.log("received: " + JSON.stringify(message))
        this.setState(prevState => {
            prevState.messages.push(message);
            return {messages: prevState.messages}
        })
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    onPlayerListReceived = (list) =>{
        this.setState({players: list})
    }

    joinRoom(room){
        this.state.socket.emit("joinChat", {
            tok: this.props.player.token,
            r: room
        })

    }

    render () {
        return (
            <div>
                <div className="container">

                   <div className="container vertical flex8">
                    <div className="chatLogWrapper">
                        <div  className="chatLogInner hiddenScroll" ref={(chatBody)=>{this.chatBody=chatBody}}>
                          {this.state.messages.map(message => {
                              return (<div className="chatMessage"><b>{message.s}</b>: {message.m}</div>)
                          })}
                        </div>
                    </div>

                    <div className="container vertical-center">
                        <div className="flex4">
                            <TextField fullWidth={true} onChange={this.onTextEnter} placeholder="Chat" value={this.state.enteredText} ref={textInput => {this.textInput = textInput}} onKeyPress={this.onKeyPress}/>
                        </div>
                        <div>
                            <RaisedButton onTouchTap={this.onChatSubmit} label="Send" primary={true}/>
                        </div>
                    </div>
                   </div>

                    <div className="playerList container vertical flex1" style={{padding: "5px" , marginLeft: "20px"}}>
                        <div className="playerListHeader">
                            Players
                        </div>
                        <hr/>
                        {this.state.players.map(player => {
                            return <div className="playerInList">{player}</div>
                        })}
                    </div>
                </div>

            </div>
        )
    }

}

export default Chat;
