import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './MultiSelect.scss';
import SelectOption from './SelectOption'
import Button from '../ButtonList/Button';

class MultiSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: []
        };
        this.select = this.select.bind(this);
    }

    select(text) {
        this.setState(state => {
            return state.selected.push(text);
        })
    }
    renderOptions() {
        return (
            <div>
                {this.props.options.map((text,i) => {
                        return <SelectOption
                            key={i}
                            text={text}
                            onClick={() => this.select(text)}
                            class={this.state.selected.includes(text)  ? "option selected" : "option" }
                        />
                    }
                )}
            </div>
        );
    }

    render() {
        return (
            <div className="multi-select">
                {this.renderOptions()}
                <br/>
                <Button
                    text="Done"
                    onClick={() => this.props.nextQuestion(this.state.selected)}
                />
            </div>
        );
    }
}

export default MultiSelect;
