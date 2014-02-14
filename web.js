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
    res.send("yolo");
    console.log("TRYING SOMETHING");
    var query = connection.query("SELECT username FROM users where username = 'c'");
    query.on('row', function(row) {
	console.log(row);
	//res.send(row.username);
    });
    query.on('error', function(error) {
	console.log("Username not found");
	res.send("derp");
    });
    
    query.on('end', function() { 
	connection.end();
	res.end("DONE FOR GOOD");
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