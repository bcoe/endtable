var endtable = require('../lib'),
	puts = require('util').puts,
	tests = [],
	couchConnectorTests = require('./couch-connector-test'),
	endtableObjectTests = require('./endtable-object-test'),
	endtableErrorHandlerTests = require('./endtable-error-handler-test'),
	monitoredObjectTests = require('./monitored-object-test'),
	endtableEngineTests = require('./endtable-engine-test');
	
var engine = new endtable.Engine({
	database: 'test',
	host: 'localhost',
	user: '',
	password: ''
});
 
function run(callback, test) {
	callback(
		function() {
			puts(test + ' \033[32m[Success]\033[m');
			if (tests.length == 0) {
			    puts(' \033[32mAll tests finished.\033[m');
			    process.exit();
			}
			
			var nextTest = tests.shift();

			engine.connector.deleteDatabase(function(error, doc) {
				engine.connector.createDatabase(function(error, doc) {
					nextTest();
				});
			});
			
		},
		test + ': '
	);
}

function addTests(testsObject) {
	for (var test in testsObject) {
		(function(func, name) {
			tests.push(function() {
				run(func, name);
			});
		})(testsObject[test], test);
	}
}

addTests(couchConnectorTests.tests);
addTests(endtableEngineTests.tests);
addTests(endtableObjectTests.tests);
addTests(endtableErrorHandlerTests.tests);
addTests(monitoredObjectTests.tests);
tests.shift()();