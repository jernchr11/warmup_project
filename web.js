// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');


var SUCCESS               =   1;
var ERR_BAD_CREDENTIALS   =  -1;
var ERR_USER_EXISTS       =  -2;
var ERR_BAD_USERNAME      =  -3;
var ERR_BAD_PASSWORD      =  -4;
var MAX_USERNAME_LENGTH = 128;
var MAX_PASSWORD_LENGTH = 128;


var connection = new pg.Client(process.env.DATABASE_URL);
connection.connect();
app.configure(function(){ app.use(express.bodyParser()); app.use(app.router); });

app.use(logfmt.requestLogger());

app.get("/", function(req,res) {
    res.set('Content-Type', 'text/plain');
    res.send("Hi :P");
});

app.post("/users/login", function(req, res) {
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel(req, res, pg);
    model.login(POST["user"], POST["password"], true);
});

app.post("/users/add", function(req, res) {
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel(req, res, pg);
    model.add(POST["user"], POST["password"], true);
});



var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


function UsersModel(req, res, db) {

    this.add = function (user, password, isWrite, callback) {
	if (user.length <= 0 || user.length > MAX_USERNAME_LENGTH) {
            var jsonResponse = {
		'errCode': ERR_BAD_USERNAME
            };
	    var myResponse = JSON.stringify(jsonResponse);
            console.log(myResponse);
	    if (isWrite) {
		res.end(myResponse);
	    }
	} else if (password.length > MAX_PASSWORD_LENGTH) {
            var jsonResponse = {
		'errCode': ERR_BAD_PASSWORD
            };
	    var myResponse = JSON.stringify(jsonResponse);
            console.log(myResponse);
	    if (isWrite) {
		res.end(myResponse);
	    }
	} else {
	}
    }



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
	    var query = connection.query("SELECT username FROM users)", function( err, result) {
		// user and password not found
		console.log("r:"+result);
		console.log("e:"+err);
		if (result.rows.length == 0) {
		    var jsonResponse = {'errCode':ERR_BAD_CREDENTIALS};
		    if (isWrite) {
			res.end(JSON.stringify(jsonResponse));
		    }
		}
		else {
		    console.log("Login Successful");
		    var count = result.rows[0].count;
		    var query = connection.query("update users set count = count + 1 where username = '"+user+"')", function( err, result) {
			var jsonResponse = {'errCode':SUCCESS,'count':(row.count+1)};
			console.log("You signed in: "+(count+1)+" times");
			if (isWrite) {
			    res.end(JSON.stringify(jsonResponse));
			}
		    });
		}
	    });	    
	}
    }
}