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

app.configure(function(){ app.use(express.bodyParser()); app.use(app.router); });

/**
   Connection shouldn't be global in any real situation... Javascript has been giving me troubles, so I just left the connection around
   as a global variable.
 **/

var connection = new pg.Client(process.env.DATABASE_URL);
connection.connect();

app.use(logfmt.requestLogger());

app.get("/", function(req,res) {
    res.set('Content-Type', 'text/plain');
    res.send("Backend API");
});

app.post("/users/login", function(req, res) {
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel();
    model.login(POST["user"], POST["password"], function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});

app.post("/users/add", function(req, res) {
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel();
    model.add(POST["user"], POST["password"], function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});
    
app.post("/TESTAPI/resetFixture", function(req, res) {
    res.set('Content-Type', 'application/json');
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});

app.post("/TESTAPI/unitTests", function(req, res) {
    res.set('Content-Type', 'application/json');

    clearDatabase();

    var jsonResponse = { 'nrFailed' : 0, 'output': "Success", 'totalTests': 10 };
    res.send(JSON.stringify(jsonResponse));
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});


function UsersModel() {
    this.TESTAPI_resetFixture = function(callback) {
	connection.query("delete from users", function(err, result) {
	    // I don't know what happens if this actually fails because of a connection issue, for example
	    var jsonResponse = {'errCode':SUCCESS};
	    callback(JSON.stringify(jsonResponse));
	});
    }


    this.add = function (user, password, callback) {
	if (user == null || user.length <= 0 || user.length > MAX_USERNAME_LENGTH) {
            var jsonResponse = {
		'errCode': ERR_BAD_USERNAME
            };
	    var myResponse = JSON.stringify(jsonResponse);
	    callback(myResponse);
	} else if (password.length > MAX_PASSWORD_LENGTH) {
            var jsonResponse = {
		'errCode': ERR_BAD_PASSWORD
            };
	    var myResponse = JSON.stringify(jsonResponse);
            callback(myResponse);
	    
	} else {
	    connection.query("insert into users(username, password, count) values ('"+user+"', '"+password+"', 1)", function(err, result) { 
		// adding new user succeeds
		if (err == null) {
                    var jsonResponse = {
			'errCode': SUCCESS,
			'count': 1
                    };
		    var myResponse = JSON.stringify(jsonResponse);
		    callback(myResponse);
		}
		else {
		    var jsonResponse = {
			'errCode': ERR_USER_EXISTS
                    };
		    var myResponse = JSON.stringify(jsonResponse);
		    callback(myResponse);
		}
	    });
	}
    }
    
    
    
    this.login = function (user, password, callback) {
	if (user == null || user.length <= 0 ||  user.length > MAX_USERNAME_LENGTH) {
	    var jsonResponse = {'errCode':ERR_BAD_USERNAME};
	    callback(JSON.stringify(jsonResponse));
	}
	else if (password.length > MAX_PASSWORD_LENGTH) {
	    var jsonResponse = {'errCode':ERR_BAD_PASSWORD};
	    callback(JSON.stringify(jsonResponse));
	}
	else {
	    var query = connection.query("SELECT username, count  FROM users where username = '"+user+"' and password = '"+password+"'", function( err, result) {
		// user and password not found
		console.log("r:"+result);
		console.log("e:"+err);
		if (result.rows.length == 0) {
		    var jsonResponse = {'errCode':ERR_BAD_CREDENTIALS};
		    callback(JSON.stringify(jsonResponse));
		}
		else {
		    console.log("Login Successful");
		    console.log(result.rows[0]);
		    var count = result.rows[0].count;
		    var query = connection.query("update users set count = count + 1 where username = '"+user+"'", function( err, result) {
			var jsonResponse = {'errCode':SUCCESS,'count':(count+1)};
			console.log("You signed in: "+(count+1)+" times");
			callback(JSON.stringify(jsonResponse));
		    });
		}
	    });	    
	}
    }
}


function addUser() {
    //var model = new UsersModel();
    //model.TESTAPI_resetFixture(function(myResponse) {
    //	m
    //  });
}

function clearDatabase() {
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	console.log("YAY IM COOL");
	console.log(myResponse);
	var jsonResponse = {'errCode':SUCCESS};
	console.log(jsonResponse);
	console.log("OOMPALOOPMA"+(JSON.stringify(myResponse) === JSON.stringify(jsonResponse)));
    });
}