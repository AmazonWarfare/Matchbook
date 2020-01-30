import React, {Component} from 'react';
import './SelectOption.scss';

class SelectOption extends Component {
    render() {
        return(
            <div className={this.props.class} onClick={this.props.onClick}>
                {this.props.text}
            </div>
        )
    }

}

export default SelectOption;