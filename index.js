let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/prog06', { useNewUrlParser: true, useUnifiedTopology : true, useFindAndModify: false });

console.log("Starting: REST App");

// Koppel Express voor de web server
const express = require('express');

// Make available via app
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

// Add entry for url /
app.get('/', function(req, res) {
    console.log("End point /")
    res.header("Content-Type", "application/json")
    res.send("{ \"message\": \"Hello World\" }");
});

let animalRouter = require('./routes/animalsRoutes')();

app.use('/api', animalRouter);

// Start web application 
app.listen(8000);