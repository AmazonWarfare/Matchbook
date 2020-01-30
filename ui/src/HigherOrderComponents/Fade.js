import React from 'react';
import {CSSTransitionGroup} from 'react-transition-group'; // ES6
import "./Fade.css";

const Fade = (WrappedComponent) => {
    return class extends React.Component {

        render(){
            return (
                <CSSTransitionGroup
                    transitionName="fade"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionLeaveTimeout={500}>
                    <WrappedComponent {...this.props} key={1}/>
                </CSSTransitionGroup>
            );
        }
    }
};

export default Fade;
