import React, {Component} from 'react';
import './App.css';
import './components/QuestionCard/QuestionCard';
import QuestionCard from "./components/QuestionCard/QuestionCard";
import NavBar from "./components/NavBar/NavBar";
import Fade from "./HigherOrderComponents/Fade";
import {INPUT_TYPES} from "./config";

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

let get_initial_axios_question = false;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_question: startup_cards.shift(),
            question_change_scheduled: false
        };
        this.nextQuestion = this.nextQuestion.bind(this);
    }

    nextQuestion(answer) {
        if (startup_cards.length > 0) {
            this.setState({current_question: startup_cards.shift()});
        } else {
            // currently a hacky way to get a bit more hang for our loading icon
            setTimeout(() => {
                if ([-1,0,1].includes(answer)) {
                    axios
                        .post('/answer', {answer})
                        .then(() => console.log('answer sent from UI'));
                }

                axios
                    .get('/question')
                    .then((res) => {
                        if(res.data.type === 0) {
                            this.setState({
                                current_question: {
                                    text: res.data.text,
                                    input_type: INPUT_TYPES.BUTTON_LIST,
                                    custom_responses: false
                                }
                            })
                        } else {
                            this.setState({
                                current_question: {
                                    text: res.data.text,
                                    input_type: INPUT_TYPES.RECOMMENDATION,
                                    custom_responses: true,
                                    options: []
                                }
                            })
                        }
                    });
            }, 500)
        }
    }

    render() {
        let FadedQuestionCard = Fade(QuestionCard);
        return (
            <div>
                <NavBar/>
                <FadedQuestionCard
                    question={this.state.current_question}
                    nextQuestion={this.nextQuestion}
                />
            </div>
        );
    }
}

export default App;

