var endtable = require('../lib'),
	fs = require('fs'),
	puts = require('sys').puts,
	tests = [],
	couchConnectorTests = require('./couch-connector-test'),
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
			nextTest();
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

(function loadFixtures() {
	var fixtures = {
		'people': ''
	};
	var size = 0;
	var count = 0;
	
	for (var fixtureName in fixtures) {
		if (fixtures.hasOwnProperty(fixtureName)) {
			fixtures[fixtureName] = JSON.parse( fs.readFileSync('tests/fixtures/' + fixtureName + '.json') );
			size += fixtures[fixtureName].length;
		}
	}

	for (var fixtureName in fixtures) {
		if (fixtures.hasOwnProperty(fixtureName)) {
			for (var i = 0, fixture; (fixture = fixtures[fixtureName][i]) != null; i++) {
				engine.saveDocument({type: fixture.type, fields: fixture}, function(error, doc) {
					count++;
					if (count == size) {
						tests.shift()();
					}
				});
			}
		}
	}
})();

addTests(couchConnectorTests.tests);
addTests(endtableEngineTests.tests);