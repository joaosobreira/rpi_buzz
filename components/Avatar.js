import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components"

const Placeholder = styled.div`
  width:100px;
  height:100px; 
  background-color: ${props => props.active? 'green':'#808080'};
`;

const Avatar = (props) => {
    return <Placeholder {...props}>{props.name}</Placeholder>
}

export default Avatar;