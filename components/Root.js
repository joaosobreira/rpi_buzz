import React, { Component } from "react";
import openSocket from 'socket.io-client'
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { Provider } from "react-redux";
import { ENDPOINT } from "../app-client/constants/setup-config";

import { connect } from "react-redux";

import {addPlayer} from '../app-client/actions/index'

import ShowView from './ShowView';
import HostView from './HostView';

class Root extends Component {

    constructor(props){
        super(props);
    }

    componentDidMount() {
        const endpoint = ENDPOINT;
        this.socket = openSocket(endpoint);
        
        this.socket.on("newPlayer", (data) => {
          console.log("New Player detected! ",data);
          this.props.addPlayer(data);
        });
/*
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
        */
      }


    componentWillUnmount() {
        socket.disconnect()
        alert("Disconnecting Socket as component will unmount")
    }

    
      render() {

        return (
            <Router>
              <Route 
                path="/" 
                exact 
                component={ShowView}
              />
              <Route 
                path="/host/"  
                component={HostView}
              />
            </Router>
        );
      }
}

function mapDispatchToProps(dispatch) {
    return {
      addPlayer: player => dispatch(addPlayer(player))
    };
}

export default connect(null, mapDispatchToProps)(Root);