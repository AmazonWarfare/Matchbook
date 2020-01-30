import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './MultiSelect.scss';
import SelectOption from './SelectOption'
import Button from '../ButtonList/Button';

class MultiSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.options.map(() => false)
        }
    }

    select(index) {
        this.setState(state => {
            return state.selected[index] = !state.selected[index];
        })
    }
    renderOptions() {
        return (
            <div>
                {this.props.options.map((text,i) => {
                        return <SelectOption
                            key={i}
                            text={text}
                            onClick={() => this.select(i)}
                            class={this.state.selected[i] ? "option selected" : "option" }
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
                    onClick={this.props.nextQuestion}
                />
            </div>
        );
    }
}

export default MultiSelect;
