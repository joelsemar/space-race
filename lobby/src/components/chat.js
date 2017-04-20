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
            socket: false
        }

    }

    componentWillMount(){
        if(!this.state.socket){
            var socket = io.connect(this.props.player.chatnode);
            this.setState({ socket: socket }, this.onSocketConnected);
        }

    }

    componentWillUnmount(){
        this.state.socket.disconnect();
    }

    onSocketConnected = () => {
        this.state.socket.on('message', this.onMessageReceived);
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
        console.log("Sending: " + JSON.stringify(payload))

        this.state.socket.emit("message", payload);
        this.setState({enteredText: ''})
        this.textInput.focus();

    }

    onMessageReceived = (message) => {
        console.log(message)
        this.setState(prevState => {
            prevState.messages.push(message);
            return {messages: prevState.messages}
        })
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
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
                <div id='chatLogWrapper'>
                    <div id='chatLogInner' className="hiddenScroll" ref={(chatBody)=>{this.chatBody=chatBody}}>
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
        )
    }

}

export default Chat;
