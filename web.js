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


});

app.post("/users/login", function(req, res) {
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel(req, res, pg);
    model.login(POST["user"], POST["password"], true);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


function UsersModel(req, res, db) {
    this.login = function (user, password, isWrite, callback) {
	if (user.length <= 0 ||  user.length > MAX_USERNAME_LENGTH) {
	    var jsonResponse = {'errCode':ERR_BAD_USERNAME};
	    if (isWrite) {
		res.send(JSON.stringify(jsonResponse));
	    }	
	}
	else if (password.length > MAX_PASSWORD_LENGTH) {
	    var jsonResponse = {'errCode':ERR_BAD_PASSWORD};
	    if (isWrite) {
		res.send(JSON.stringify(jsonResponse));
	    }	
	}
	else {
	    var jsonResponse = {'errCode':40};
	    if (isWrite) {
		res.send(JSON.stringify(jsonResponse));
	    }
	}
    }
}