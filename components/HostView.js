import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from 'styled-components';

import { connect } from "react-redux";

import {addPlayer} from '../app-client/actions/index'

class HostView extends Component {

    constructor(props){
        super(props);
    }

    render() {

        return (
            <div>
                <button onClick={() => this.emitHandler("setupNewGame")}>Setup New Game</button>
                <button onClick={() => this.emitHandler("stopPolling")}>Stop Polling</button>
                <button onClick={() => this.emitHandler("nextQuestion")}>Next Question</button>
                <button onClick={() => this.emitHandler("endQuestion")}>End Question</button>
                <button onClick={() => this.props.addPlayer({"name": "Player 1", "active": true})}>Add Fake Player</button>
            </div>
        )

    }

}

function mapDispatchToProps(dispatch) {
    return {
      addPlayer: player => dispatch(addPlayer(player))
    };
}

export default connect(null, mapDispatchToProps)(HostView);