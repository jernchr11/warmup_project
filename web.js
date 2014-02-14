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
    console.log("TRYING SOMETHING");
    connection.query("CREATE TABLE distributors ( did integer, name varchar(40), PRIMARY KEY(did) )", function(err) {
	console.log("MYERROR: "+err);
	console.log(err == null);
	/*
	connection.query("insert into users(user, password, integer) values ('a', 'b', 1)", function(err) {
	    console.log(err);
	    res.write("FINISHED");
	    var query = client.query("SELECT * FROM users");
	    query.on('row', function(row) {
		res.send(row);
	    });

	    query.on('end', function() { 
		client.end();
		res.end("DONE FOR GOOD");
	    });
	});
	*/
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