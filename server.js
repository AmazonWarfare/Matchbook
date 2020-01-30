const express = require("express");
const path = require('path');
const body_parser = require("body-parser");

const app = express();

//add body parser middleware to server
app.use(body_parser.json());

app.use(express.static('ui/build'));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'ui', 'build', 'index.html'))
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
