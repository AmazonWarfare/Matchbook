import React, {Component} from 'react';
import './Button.scss';

class Button extends Component {
    render() {
        return(
            <div className="button" onClick={this.props.onClick}>
                {this.props.text}
            </div>
        )
    }

}

export default Button;