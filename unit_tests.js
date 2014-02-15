
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



exports.testSomethingElse = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};