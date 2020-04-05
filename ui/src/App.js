import React, {Component} from 'react';
import './App.scss';
import './components/QuestionCard/QuestionCard';
import QuestionCard from "./components/QuestionCard/QuestionCard";
import NavBar from "./components/NavBar/NavBar";
import Fade from "./HigherOrderComponents/Fade";
import {INPUT_TYPES, QUESTION_FORMATS} from "./config";
import Button from './components/Inputs/ButtonList/Button';

import axios from "axios";

let startup_cards = [
    {
        text: "Welcome to Matchbook",
        input_type: INPUT_TYPES.BUTTON_LIST,
        custom_responses: true,
        options: [
            "Next"
        ]
    }, {
        text: "We will ask you a series of questions to gauge your interest in topics from our library of books",
        input_type: INPUT_TYPES.BUTTON_LIST,
        custom_responses: true,
        options: [
            "Next"
        ]
    }, {
        text: "Each answer will gather information about your preferences to tune our recommendation!",
        input_type: INPUT_TYPES.BUTTON_LIST,
        custom_responses: true,
        options: [
            "Let's get started!"
        ]
    }
];


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_question: startup_cards.shift(),
            question_change_scheduled: false
        };
        this.nextQuestion = this.nextQuestion.bind(this);
    }

    mapQuestionToCardQuestion(question) {
        let cardQuestion = {
            text: question.text
        };
        if (question.type === QUESTION_FORMATS.TERNARY) {
            cardQuestion = {
                ...cardQuestion,
                input_type: INPUT_TYPES.BUTTON_LIST,
                custom_responses: false
            }
        } else if (question.type === QUESTION_FORMATS.MULTI) {
            cardQuestion = {
                ...cardQuestion,
                input_type: INPUT_TYPES.MULTISELECT,
                options: question.content.options
            }
        }
        return cardQuestion;
    }

    isFirstQuestion = false;

    nextQuestion(answer) {
        if (startup_cards.length > 0) {
            this.setState({current_question: startup_cards.shift()});
            if (startup_cards.length === 0) {
                this.isFirstQuestion = true;
            }
        } else if (this.isFirstQuestion) {
            axios.get('/question')
                .then((res) => {
                    let question = res.data.question;
                    let cardQuestion = this.mapQuestionToCardQuestion(question);

                    this.setState({
                        current_question: cardQuestion
                    });
                });

            this.isFirstQuestion = false;
        } else {
            // currently a hacky way to get a bit more hang for our loading icon
            setTimeout(() => {
                axios
                    .post('/answer', {answer})
                    .then(() => console.log('answer sent from UI'));

                axios
                    .get('/question')
                    .then((res) => {
                        /*
                            here, res is a question object with {text, type, content}
                            The type is a QUESTION_FORMAT type, each has its own needed
                            configuration to be passed as the question (through
                            state.current_question. This code disassembles the response
                            object and creates the question configuration as needed by the
                            QuestionCard object
                         */
                        let question = res.data.question;
                        let cardQuestion = this.mapQuestionToCardQuestion(question);

                        this.setState({
                            current_question: cardQuestion
                        });
                    });
            }, 500)
        }
    }

    restart() {
        console.log('restart logic here');
    }

    render() {
        let FadedQuestionCard = Fade(QuestionCard);
        return (
            <div>
                <NavBar/>
                <div className={'content'}>
                    <FadedQuestionCard
                        question={this.state.current_question}
                        nextQuestion={this.nextQuestion}
                    />
                    <div className={'restart-container'}>
                        <Button text={'Start Over'} onClick={this.restart}/>
                    </div>
                </div>
            </div>

        );
    }
}

export default App;

