/*
    This file defines routes for the API between the web server and the frontend.

    The api is very straightforward: The UI can GET the next question and POST the response to the last question.
    This mirrors the API between our server and the service which queries Watson.
 */
const express = require("express");
const QuestionGenerator = require("../QuestionGenerator/QuestionGenerator");
const router = express.Router();

let qg = new QuestionGenerator();

/*
    ROUTE: GET question
    Gets the next question to preset to user
    Responds with question text as plaintext string
 */
router.get('/question', (req, res) => {
    let question_promise = qg.generateQuestion();

    question_promise
        .then((question) => {
            let {text, type, content} = question;
            let responseObject = {
                question: {text, type, content}
            };
            res.send(JSON.stringify(responseObject));
        })
        .catch((err) => {
                console.log(err);
            }
        )

});

/*
    ROUTE: POST answer
    Responds to a question with an answer from {-1,0,1}
    Body of post is JSON with a field "answer"
 */
router.post('/answer', (req, res) => {
    let answer = req.body.answer;
    /*if (![-1, 0, 1].includes(answer)) {
        res.status(404);
        res.send("invalid answer");
    }*/
    // Here we will respond to the question through another call to WQS
    qg.provideAnswer(answer);
    res.status(200);
    res.send();
});

/*
    ROUTE: RESET
    resets the QuestionGenerator interface
 */
router.get('/reset', (req, res) => {
    qg.reset();

    let question_promise = qg.generateQuestion();

    question_promise.then(question => {
        let responseObject = {
            question
        };
        res.send(JSON.stringify((responseObject)));
    })
    .catch(err => {
        console.log(err);
    })
})

module.exports = router;