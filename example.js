var myModule = require('./web.js');

exports.testSomething = function(test){
	var myModel = new UsersModel();
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testSomethingElse = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};
