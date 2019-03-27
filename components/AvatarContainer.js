import React, { Component } from "react";
import ReactDOM from "react-dom";

import Avatar from "./Avatar";
import styled from 'styled-components'


// Styled
const AvatarList = styled.div`
    display: flex;
    justify-content: space-evenly;
`;

class AvatarContainer extends Component {

    constructor(props) {
        super(props);
      }

    render() {
        return (
            <AvatarList>
            { this.props.players.map((value) => 
                <Avatar name={value.name} active={value.active} />
            )}
            </AvatarList>
        )
    }

}

export default AvatarContainer;
