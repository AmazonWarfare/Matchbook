import React, {Component} from 'react';
import {
    Container
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuestionCard.scss';
import ButtonList from "../Inputs/ButtonList/ButtonList";
import Button from "../Inputs/ButtonList/Button";
import MultiSelect from "../Inputs/MultiSelect/MultiSelect";
import {INPUT_TYPES} from "../../config";
import loader from "./Lava Lamp-0.8s-200px.svg";
import ProfileForm from "../Inputs/ProfileForm/ProfileForm";

class QuestionCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            answer_clicked: false
        };
        this.renderInputs = this.renderInputs.bind(this);
        this.load = this.load.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.reset = this.reset.bind(this);
        this.giveRec = this.giveRec.bind(this);
    }

    load() {
        this.setState({answer_clicked: true});
    }

    nextQuestion(ans) {
        this.load();
        this.props.nextQuestion(ans);
    }

    reset() {
        this.load();
        this.props.reset();
    }

    giveRec() {
        this.load();
        this.props.giveRec();
    }

    renderText() {
        console.log(this.props.question.text);
        if (Array.isArray(this.props.question.text)) {
            // allows multi-line text to render as separate paragraphs
            let question_paragraphs = this.props.question.text.map(p => {
                return (
                    <p>
                        {p}
                    </p>
                )
            });
            console.log(question_paragraphs)
            return question_paragraphs;
        }
        console.log("here")
        return (<p>
                {this.props.question.text}
            </p>
        );
    }

    renderInputs() {
        if (this.props.question.input_type === INPUT_TYPES.BUTTON_LIST) {
            return (
                <ButtonList
                    nextQuestion={this.nextQuestion} // gets applied to each button
                    buttons={this.props.question.options} //list of text for buttons
                    custom_responses={this.props.question.custom_responses} //decides if we use custom responses in button list or just -1,0,1
                />
            )
        } else if (this.props.question.input_type === INPUT_TYPES.MULTISELECT) {
            return (
                <MultiSelect
                    nextQuestion={this.nextQuestion} // gets applied to "done" button
                    options={this.props.question.options}
                />
            )
        }
    }

    renderMetaControls() {
        let recButton;

        if (!this.props.startup) {
            recButton = (<Button text={'I\'m feeling lucky!'}
                                 onClick={this.giveRec}/>);
        }

        return (
            <div className={'meta-controls'}>
                <Button text={'Start Over'} onClick={this.reset}/>
                {recButton}
            </div>
        )
    }

    render() {
        if (this.state.answer_clicked) {
            /*
            *   LOADING
             */
            return (
                <div>
                    <Container className={`question-card-component clicked`}>
                        <object type="image/svg+xml" className="loader" data={loader}>loading...</object>
                    </Container>
                </div>
            )
        } else if (this.props.profileForm) {
            /*
            * Profile Form
             */
            return (
                <div>
                    <Container className={`question-card-component`}>
                        <ProfileForm
                            nextQuestion={this.nextQuestion}
                        />
                    </Container>
                    {this.renderMetaControls()}
                </div>
            )
        } else {
            /*
            * Standard question
             */
            return (
                <div>
                    <Container className={`question-card-component`}>
                        <Container className="question-text">
                            {this.renderText()}
                        </Container>
                        <Container className={"input-container"}>
                            {this.renderInputs()}
                        </Container>
                    </Container>
                    {this.renderMetaControls()}
                </div>
            );
        }
    }
}

export default QuestionCard;

