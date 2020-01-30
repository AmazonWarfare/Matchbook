import React, {Component} from 'react';
import './App.css';
import './components/QuestionCard/QuestionCard';
import QuestionCard from "./components/QuestionCard/QuestionCard";
import NavBar from "./components/NavBar/NavBar";
import Fade from "./HigherOrderComponents/Fade";
import {INPUT_TYPES} from "./config";

let questions = [
    {
        text: "I want...",
        input_type: INPUT_TYPES.BUTTON_LIST,
        options: [
            "A recommendation based off previous books I've read",
            "A recommendation based off my genre preferences"
        ]
    },
    {
        text: "What reading level are you looking for?",
        input_type: INPUT_TYPES.BUTTON_LIST,
        options: [
            "Adult",
            "Young Adult",
            "Children"
        ]
    },
    {
        text: "What type of book are you looking for?",
        input_type: INPUT_TYPES.BUTTON_LIST,
        options: [
            "Fiction",
            "Non-fiction",
            "I don't care."
        ]
    },
    {
        text: "What genres are you interested in?",
        input_type: INPUT_TYPES.MULTISELECT,
        options: [
            "Romance",
            "Science Fiction",
            "Fantasy",
            "Horror",
            "Historical",
            "Mystery",
            "Adventure",
            "Thriller",
            "Self-help",
            "Biographical",
        ]
    },
    {
        text: "I recommend: Pride and Prejudice"
    }
];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_question: questions.shift(),
            question_change_scheduled: false
        };
        this.nextQuestion = this.nextQuestion.bind(this);
    }

    nextQuestion() {
        this.setState({
            current_question: questions.shift()
        });
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

