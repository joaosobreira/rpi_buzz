import React, { Component } from "react";
import openSocket from 'socket.io-client'
import ReactDOM from "react-dom";
import AvatarContainer from "./AvatarContainer";
import styled from 'styled-components';

const Container = styled.div`
display:flex;
flex-direction: column;
height:100%;
min-height: 100%;
background-color:red;
`;

const Header = styled.div`
display: flex;
flex: 1;
background-color:blue;
justify-content: center;
align-items: center;
`;

const Content = styled.div`
display: flex;
flex-direction: column;
flex: 3;
background-color:yellow;
justify-content: space-evenly;
align-items: center;
`;

const Footer = styled.div`
flex: 1;
background-color:blue;
display: flex;
flex-direction: column;
justify-content: stretch;
`;

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

  componentDidMount() {
    const { endpoint } = this.state;
    this.socket = openSocket(endpoint);
    this.socket.on("newPlayer", (data) => {
      console.log("New Player detected! ",data);
      this.handleNewPlayer(data);
    });
    this.socket.on("nextQuestion", (data) => {
      console.log("Next Question: ",data);
      let questionOptionsMap = new Map(JSON.parse(data.questionOptions));
      console.log("Map: ",questionOptionsMap)
      this.setState({
        question: data.questionText,
        options: questionOptionsMap,
        correctOption: data.correctOption
      })
    });
  }

  emitHandler(emitEvent) {
    this.socket.emit(emitEvent);
    console.log("Emited ", emitEvent, " from button");
  }

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

  render() {


    return (
        <Container>
        <Header>
          <button onClick={() => this.emitHandler("setupNewGame")}>Setup New Game</button>
          <button onClick={() => this.emitHandler("stopPolling")}>Stop Polling</button>
          <button onClick={() => this.emitHandler("nextQuestion")}>Next Question</button>
          <button onClick={() => this.emitHandler("endQuestion")}>End Question</button>
        </Header>
        <Content>
          <h1>{this.state.question}</h1>
          { Array.from(this.state.options.values()).map((value) => <h2>{value}</h2>)}
        </Content>
        <Footer>
          <AvatarContainer players={this.state.players} />
        </Footer>
        </Container>
    );
  }
}
export default App;