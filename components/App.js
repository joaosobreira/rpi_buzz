import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from 'styled-components';

import Root from './Root';

import { Provider } from "react-redux";
import store from "../app-client/store/index";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://192.168.1.71:4000", // this is where we are connecting to with sockets
      question: "Placeholder Question",
      options: new Map([
        [1,"Placeholder Option 1"], 
        [2,"Placeholder Option 2"],
        [3,"Placeholder Option 3"],
        [4,"Placeholder Option 4"]
      ]),
      players: [{
          "name": "Player 1",
          "remote": 0,
          "points": 0,
          "active": false
            }, 
        {
          "name": "Player 2",
          "remote": 0,
          "points": 0,
          "active": false
            },
        {
          "name": "Player 3",
          "remote": 0,
          "points": 0,
          "active": false
            },
        {
          "name": "Player 4",
          "remote": 0,
          "points": 0,
          "active": false
            },
      ],
      correctOption: 0
    }
  }

  emitHandler(emitEvent) {
    this.socket.emit(emitEvent);
    console.log("Emited ", emitEvent, " from button");
  }
/*
  handleNewPlayer(ctrl) {
    for (const [i, value] of this.state.players.entries()) {
      if(!value.active){
        let newPlayers = [...this.state.players];
        newPlayers[i].active = true;
        newPlayers[i].remote = ctrl;
        this.setState({players: newPlayers});
        break;
      }
    }
  }
*/
  render() {


    return (
      <Provider store={store}>
        <Root />
      </Provider>
    );
  }
}

export default App;