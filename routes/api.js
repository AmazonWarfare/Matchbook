/*
    This file defines routes for the API between the web server and the frontend.

    The api is very straightforward: The UI can GET the next question and POST the response to the last question.
    This mirrors the API between our server and the service which queries Watson.
 */
const express = require("express");
const WatsonQueryingService = require("../WatsonQueryingService/WatsonQueryingService");
const router = express.Router();

let wqs = new WatsonQueryingService();

/*
    ROUTE: GET question
    Gets the next question to preset to user
    Responds with question text as plaintext string
 */
router.get('/question', (req, res) => {
    let question_text = wqs.generateQuestion();
    res.send(question_text);
});

/*
    ROUTE: POST answer
    Responds to a question with an answer from {-1,0,1}
    Body of post is JSON with a field "answer"
 */
router.post('/answer', (req, res) => {
    let answer = parseInt(req.body.answer);
    if (![-1, 0, 1].includes(answer)) {
        res.status(404);
        res.send("invalid answer");
    }
    // Here we will respond to the question through another call to WQS
    wqs.provideAnswer(answer);
    res.status(200);
    res.send();
});

module.exports = router;