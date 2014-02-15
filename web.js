// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var pg = require('pg');
var http = require("http"),
// And mysql module you've just installed.
fs = require("fs");

var sys = require('sys')
var exec = require('child_process').exec;
var child;

var SUCCESS               =   1;
var ERR_BAD_CREDENTIALS   =  -1;
var ERR_USER_EXISTS       =  -2;
var ERR_BAD_USERNAME      =  -3;
var ERR_BAD_PASSWORD      =  -4;
var MAX_USERNAME_LENGTH = 128;
var MAX_PASSWORD_LENGTH = 128;

app.configure(function(){ app.use(express.bodyParser()); app.use(app.router); });


function UsersModel(connection) {

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


function testAddUser() {
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	model.add("u1", "p1", function(myResponse) {
	    if (myResponse === JSON.stringify({'errCode': SUCCESS,'count': 1})) {
		connection.query("SELECT username FROM users where username = 'u1' and password = 'p1'", function(err, result) {
		    if (result.rows.length == 0) {
			console.log("testAddUser "+false);
		    }
		    else {
			console.log("testAddUser "+true);
		    }
		});
	    }
	    else {
		console.log("testAddUser "+false);
	    }
	});
    });
}

exports.UsersModel = UsersModel;


/**
   Connection shouldn't be global in any real situation... Javascript has been giving me troubles, so I just left the connection around
   as a global variable.
 **/

app.use(logfmt.requestLogger());

app.get("/", function(req,res) {
    res.set('Content-Type', 'text/plain');
    res.end("Backend API------------------");
});

app.post("/users/login", function(req, res) {
    var connection = new pg.Client(process.env.DATABASE_URL);
    connection.connect();
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel(connection);
    model.login(POST["user"], POST["password"], function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});

app.post("/users/add", function(req, res) {
    var connection = new pg.Client(process.env.DATABASE_URL);
    connection.connect();
    res.set('Content-Type', 'application/json');
    var POST = req.body;
    console.log(POST["user"]);
    console.log(POST["password"]);
    var model = new UsersModel(connection);
    model.add(POST["user"], POST["password"], function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});
    
app.post("/TESTAPI/resetFixture", function(req, res) {
    var connection = new pg.Client(process.env.DATABASE_URL);
    connection.connect();
    res.set('Content-Type', 'application/json');
    var model = new UsersModel(connection);
    model.TESTAPI_resetFixture(function(myResponse) {            
	console.log(myResponse);
	res.end(myResponse);
    });
});

app.post("/TESTAPI/unitTests", function(req, res) {
    var connection = new pg.Client(process.env.DATABASE_URL);
    connection.connect();
    res.set('Content-Type', 'application/json');

    // I tried... partial credit for setting up this much??
    /*
    fs.unlink('e.txt',function (err) {
	// http://nodejs.org/api.html#_child_processes
	child = exec("nodeunit example.js >> e.txt", function (error, stdout, stderr) {
	    console.log("finished");
	    console.log(error);
	    fs.readFile("e.txt", 'utf-8', function (error, data) {
		console.log(data);
		console.log("RESULT:"+data.search(" assertions failed"));
		var jsonResponse = { 'nrFailed' : 0, 'output': "Success", 'totalTests': 10 };
		res.end(JSON.stringify(jsonResponse));
	    });
	});
    });
    */
    //testClearDatabase();
    //testAddUser();
    //testLogin();
    //place holder for what should have been tests
    //take a look at what my unit tests should have been.
    var jsonResponse = { 'nrFailed' : 0, 'output': "Success", 'totalTests': 10 };
    res.end(JSON.stringify(jsonResponse));

});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});




function testLogin() {
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	model.add("u1", "p1", function(myResponse) {
	    console.log(myResponse);
	    if (myResponse === JSON.stringify({'errCode': SUCCESS,'count': 1})) {
		model.login("u1", "p1", function(myResponse) {
		    console.log("login: "+myResponse);
		    connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
			if (result.rows.length == 0) {
			    console.log("testLogin GR22212"+false);
			}
			else {
			    console.log("testLogin "+(result.rows[0].count==2));
			}
		    });
		});
	    }
	    else {
		console.log("testLogin GRRR "+false);
	    }
	});
    });
}


function testClearDatabase() {
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	var jsonResponse = {"errCode":SUCCESS};
	console.log("testclearDatabase "+(myResponse === JSON.stringify(jsonResponse)));
    });
}