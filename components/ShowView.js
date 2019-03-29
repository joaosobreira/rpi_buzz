import React, { Component } from "react";
import ReactDOM from "react-dom";
import AvatarContainer from "./AvatarContainer";
import styled from 'styled-components';

import { connect } from "react-redux";

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

class ShowView extends Component {

    constructor(props){
        super(props);
    }

    render(){

        return (
            <Container>
                <Header>
                    <h1>30</h1>
                </Header>
                <Content>
                    <h1>Question</h1>
                    <h2>Option 1</h2>
                    <h2>Option 2</h2>
                    <h2>Option 3</h2>
                    <h2>Option 4</h2>
                </Content>
                <Footer>
                    <AvatarContainer players={this.props.players} />
                </Footer>
            </Container>
        )
    }
}

const mapStateToProps = state => {
    return { players: state.players };
  };

export default connect(mapStateToProps)(ShowView);