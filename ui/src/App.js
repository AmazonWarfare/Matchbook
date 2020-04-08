import React, {Component} from 'react';
import './App.scss';
import './components/QuestionCard/QuestionCard';
import QuestionCard from "./components/QuestionCard/QuestionCard";
import NavBar from "./components/NavBar/NavBar";
import Fade from "./HigherOrderComponents/Fade";
import {INPUT_TYPES, QUESTION_FORMATS} from "./config";

import axios from "axios";

let startup_cards = [
    {
        text: "Welcome to MatchBook!",
        type: QUESTION_FORMATS.BUTTON,
        content: {
            options: [
                "Next",
            ]
        }
    }, {
        text: "We will ask you a series of questions to gauge your interest in topics from our library of books",
        type: QUESTION_FORMATS.BUTTON,
        content: {
            options: [
                "Next"
            ]
        }
    },  {
        text: "Each answer will gather information about your preferences to tune our recommendation.",
        type: QUESTION_FORMATS.BUTTON,
        content: {
            options: [
                "Next"
            ]
        }
    }, {
        text: "When we have enough info we will give you our best guess at a book you might like. You can also get a recommendation at any time during the process.",
        type: QUESTION_FORMATS.BUTTON,
        content: {
            options: [
                "Let's get started!"
            ]
        }
    }
];


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_question: App.mapQuestionToCardQuestion(startup_cards[this.questionIndex])
        };
        this.setNextQuestion = this.setNextQuestion.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
        this.reset = this.reset.bind(this);
        this.giveRec = this.giveRec.bind(this);
    }

    questionIndex = 0;
    static mapQuestionToCardQuestion(question) {
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
        } else if (question.type === QUESTION_FORMATS.BUTTON) {
            cardQuestion = {
                ...cardQuestion,
                input_type: INPUT_TYPES.BUTTON_LIST,
                custom_responses: true,
                options: question.content.options
            }
        }
        return cardQuestion;
    }

    setNextQuestion(q) {
        let cardQuestion = App.mapQuestionToCardQuestion(q);
        this.setState({
            current_question: cardQuestion
        });
    }

    nextQuestion(answer) {
        this.questionIndex++;
        if (this.questionIndex < startup_cards.length) {
            this.setNextQuestion(startup_cards[this.questionIndex]);
            if (startup_cards.length === 0) {
                this.isFirstQuestion = true;
            }
        } else if (this.questionIndex === startup_cards.length) {
            axios.get('/question')
                .then((res) => {
                    this.setNextQuestion(res.data.question);
                });
        } else {
            // currently a hacky way to get a bit more hang for our loading icon
            setTimeout(() => {
                axios
                    .post('/answer', {answer})
                    .then(() => console.log('answer sent from UI'));

                axios
                    .get('/question')
                    .then((res) => {
                        this.setNextQuestion(res.data.question);
                    });
            }, 500)
        }
    }

    reset() {
        this.questionIndex = 0;
        axios.get('/reset')
        this.setNextQuestion(startup_cards[0]);
    }

    giveRec() {
        axios
            .post('/answer', {answer: "fin"})
        axios
            .get('/question')
            .then((res) => {
                this.setNextQuestion(res.data.question);
            })
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
                        reset={this.reset}
                        giveRec={this.giveRec}
                        startup={this.questionIndex < startup_cards.length}
                    />
                </div>
            </div>

        );
    }
}

export default App;

