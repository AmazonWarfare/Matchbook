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
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis, urna vel iaculis condimentum, diam dui accumsan sapien, nec vestibulum mi orci eget eros. Integer consectetur placerat finibus. Nullam pharetra, purus a rhoncus volutpat, lacus felis ultricies velit, id commodo erat dui non erat. Vestibulum nulla lorem, sodales a fermentum in, tincidunt in ipsum. Phasellus quis facilisis ex. Sed a orci eget turpis varius eleifend ac non ligula. Aliquam sit amet placerat dolor. Mauris vestibulum, enim sit amet feugiat euismod, tortor justo lacinia arcu, nec cursus dui magna ut ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus maximus cursus scelerisque. Quisque porttitor tortor consequat, accumsan sapien nec, finibus lectus. Curabitur et auctor risus. Vestibulum dignissim pharetra magna, quis porta purus sollicitudin et. Nam efficitur diam sapien, eu viverra massa lobortis eu. Vestibulum odio tellus, molestie sed odio sed, bibendum sollicitudin nulla. Duis tincidunt pretium lorem, sit amet tempor leo fermentum at.\n" +
            "\n" +
            "Curabitur eleifend lacinia imperdiet. Nunc viverra nisl vel volutpat iaculis. Suspendisse congue, justo vel suscipit mattis, augue lacus consectetur massa, elementum placerat est arcu et purus. Phasellus in viverra nunc. In diam orci, aliquet vel tincidunt eget, varius at leo. Etiam consequat nec ante nec aliquet. Integer sed pharetra massa. Quisque quam leo, placerat fringilla justo vel, sollicitudin euismod ex. Pellentesque ut ullamcorper tellus. Praesent tristique fringilla quam vel sollicitudin. Morbi dictum congue nisi, sit amet fringilla turpis consectetur non.\n" +
            "\n" +
            "Etiam sit amet leo a nulla hendrerit ultrices. Nunc tincidunt purus tortor. Etiam viverra leo ut porttitor ultricies. Morbi vel magna placerat risus hendrerit pharetra non eget diam. Proin luctus ut odio et finibus. Suspendisse bibendum pretium urna vitae lacinia. Curabitur hendrerit convallis erat, vel fringilla dolor suscipit eget. Praesent et diam non lacus tristique efficitur. Aenean at justo feugiat, molestie arcu vitae, placerat arcu. Sed eu ex a odio maximus semper sed et erat. Cras scelerisque odio a neque imperdiet rutrum. Duis a semper eros.\n" +
            "\n" +
            "Cras lobortis sem et lacus semper, in aliquam nisl mattis. Aenean at fermentum elit, in efficitur ex. Nunc finibus turpis at ullamcorper elementum. Proin non lorem quam. Nulla odio enim, vestibulum feugiat molestie eget, feugiat eu tellus. Vestibulum eget mi vitae massa viverra porta. Cras tempor diam iaculis lacus mollis ullamcorper. Morbi ut dui feugiat, ultricies lectus in, ultricies nulla.",
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

