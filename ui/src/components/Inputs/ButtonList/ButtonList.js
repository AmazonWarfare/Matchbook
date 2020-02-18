import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './ButtonList.scss';
import Button from './Button'

class ButtonList extends Component {
    renderButtons() {
        if(this.props.custom_responses) {
            return (
                <div className="button-list">
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

        return (
            <div className="button-list">
                <Button
                    text={"Negative"}
                    onClick={() => this.props.nextQuestion(-1)}
                />
                <Button
                    text={"Neutral"}
                    onClick={() => this.props.nextQuestion(0)}
                />
                <Button
                    text={"Positive"}
                    onClick={() => this.props.nextQuestion(1)}
                />
            </div>
        );
    }

    render() {
        return (
            <div >
                {this.renderButtons()}
            </div>
        );
    }
}

export default ButtonList;
