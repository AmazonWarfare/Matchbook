const express = require("express");
const path = require('path');
const body_parser = require("body-parser");

//init app
const app = express();

//add body parser middleware to server
app.use(body_parser.json());

/*  ROUTE: INDEX
    Serves static UI build from ./ui/build directory.
*/
app.use(express.static('ui/build'));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'ui', 'build', 'index.html'))
});

// adds routes from ./routes directory
const api = require("./routes/api");
app.use("/", api);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
