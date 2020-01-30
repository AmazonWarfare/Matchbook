import React, { Component } from 'react';
import logo from "./MatchBookLogo.png"
import './NavBar.scss';
class NavBarLogo extends Component {
    render() {
        return (
            <img src={logo} alt="Matchbook" className="logo"/>
        );
    }
}

export default NavBarLogo