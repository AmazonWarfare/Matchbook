import React, {Component} from 'react';
import {
    Container
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuestionCard.scss';
import ButtonList from "../Inputs/ButtonList/ButtonList";
import MultiSelect from "../Inputs/MultiSelect/MultiSelect";
import {INPUT_TYPES} from "../../config";

class QuestionCard extends Component {
    renderInputs() {
        if (this.props.question.input_type === INPUT_TYPES.BUTTON_LIST) {
            return <ButtonList
                nextQuestion={this.props.nextQuestion} // gets applied to each button
                buttons={this.props.question.options} //list of text for buttons
            />
        } else if(this.props.question.input_type === INPUT_TYPES.MULTISELECT) {
            return <MultiSelect
                nextQuestion={this.props.nextQuestion} // gets applied to "done" button
                options={this.props.question.options}
            />
        }
    }

    render() {
        return (
            <div>
                <Container className={`question-card-component`}>
                    <div className="question-text">
                        {this.props.question.text}
                    </div>
                    {this.renderInputs()}
                </Container>
            </div>
        );
    }
}

export default QuestionCard;

