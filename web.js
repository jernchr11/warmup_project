// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');
var connection = new pg.Client(process.env.DATABASE_URL);
connection.connect();
app.configure(function(){ app.use(express.bodyParser()); app.use(app.router); });

app.use(logfmt.requestLogger());

app.get("/", function(req,res) {
    res.set('Content-Type', 'text/plain');
    res.send("Hi :P");
    console.log("Beginning query:");
    var query = connection.query("SELECT username FROM users where username = 'a'", function( err, result) {
	console.log(result);
    });
});

app.post("/users/login", function(req, res) {
    res.set('Content-Type', 'text/plain');
    console.log("SWAG BEAST");
    console.log(req.body);
    res.end("swag");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});