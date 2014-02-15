// couldn't get these to run sadly.
// partial credit?

exports.testClearDb = function(test){
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	var jsonResponse = {"errCode":SUCCESS};
	test.strictEqual((myResponse === JSON.stringify(jsonResponse)), true, "Db clear failed");
    });
};

exports.addUser = function(test){
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	model.add("u1", "p1", function(myResponse) {
	    test.strictEqual(myResponse === JSON.stringify({'errCode': SUCCESS,'count': 1}), true, "add user failed");
	    connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
		test.ok(result.rows.length != 0, "add user failed");
	    });
	});
    });
}

exports.loginUser = function(test){
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	model.add("u1", "p1", function(myResponse) {
	    test.strictEqual(myResponse === JSON.stringify({'errCode': SUCCESS,'count': 1}), true, "add user failed");
	    connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
		test.ok(result.rows.length != 0, "add user failed");
		model.login("u1", "p1", function(myResponse) {
		    connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
			test.ok(result.rows[0].count==2, "login user count failed");
		    });
		});
	    });
	});
    });
}

exports.loginUserTwice = function(test){
    var model = new UsersModel();
    model.TESTAPI_resetFixture(function(myResponse) {
	model.add("u1", "p1", function(myResponse) {
	    test.strictEqual(myResponse === JSON.stringify({'errCode': SUCCESS,'count': 1}), true, "add user failed");
	    connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
		test.ok(result.rows.length != 0, "add user failed");
		model.login("u1", "p1", function(myResponse) {
		    model.login("u1", "p1", function(myResponse) {
			connection.query("SELECT count FROM users where username = 'u1' and password = 'p1'", function(err, result) {
			    test.ok(result.rows[0].count==3, "login user count failed");
			});
		    });
		});
	    });
	});
    });
}

exports.addUserLong = function(test){
    var longUser = "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu";
    model.add(longUser, "p1", function(myResponse) {
	test.equal(myResponse, JSON.stringify({'errCode': ERR_BAD_USERNAME,'count': 1}), true, "add user long failed");
    });
}

exports.addUserShort = function(test){
    model.add("", "p1", function(myResponse) {
	test.equal(myResponse, JSON.stringify({'errCode': ERR_BAD_USERNAME,'count': 1}), true, "add user long failed");
    });
}

exports.addUserLong = function(test){
    var longpass = "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu";
    model.add("u1", longPass, function(myResponse) {
	test.equal(myResponse, JSON.stringify({'errCode': ERR_BAD_PASSWORD,'count': 1}), true, "add user long failed");
    });
}