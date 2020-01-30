import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './ButtonList.scss';
import Button from './Button'

class ButtonList extends Component {
    renderButtons() {
        return (
            <div>
                {this.props.buttons.map((text, ind) => {
                        return <Button
                            key={ind}
                            text={text}
                            onClick={this.props.nextQuestion}
                        />
                    }
                )}
            </div>
        );
    }

    render() {
        return (
            <div className="button-list">
                {this.renderButtons()}
            </div>
        );
    }
}

export default ButtonList;
