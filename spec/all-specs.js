require.paths.unshift(__dirname);
require('./lib/jspec');

var fs = require('fs');
var sys = require('sys');

endtable = require('endtable');
connector = require('../lib/endtable/couch-connector');

// Constants for tests.
TIMEOUT_INTERVAL = 2000; // What should timeouts for asych tasks default to.
TOTAL_TEST_TIME = 10000; // We must wait a period after running tests for all
						// the asynchronous tests to complete execution.
EXPECTED_HOST = 'localhost' // The host we expect the couch connector to talk to.
LEGACY_VIEW = true; // Should we use the legacy couch views? PRE 0.9.0

if (LEGACY_VIEW) {
	var init = endtable.Engine.prototype.init;
	endtable.Engine.prototype.init = function() {
		init.apply(this, arguments);
		this.connector.legacy = true;
	};
}

var endtableEngine = new endtable.Engine({
	database: 'test'
});

/**
 * Run tests after a setTimeout which allows asynchronous
 * tests time to complete.
 */
function runTestsAsync() {
	specs = {
		independant: [
			'endtable-engine',
			'couch-connector',
			'endtable-object',
			'error-handler'
		]
	}
	
	// Capture command-line input.
	if (process.ARGV.length <= 2) {
	    run(specs.independant);
	} else {
	    run([process.ARGV[2]]);
	}

	function run(specs) {
		var tests = [];
		
		specs.forEach(function(spec){
			JSpec.exec('spec/spec.' + spec + '.js');
		})
		
		// We should wait for all asynchronous calls to finish before running the report.
		setTimeout(function() {
			JSpec.report()
		}, TOTAL_TEST_TIME);
		
		JSpec.run()
	}
}

function loadFixtures() {
	var fixtures = {
		'people': ''
	};
	var size = 0;
	var count = 0;
	
	for (var fixtureName in fixtures) {
		if (fixtures.hasOwnProperty(fixtureName)) {
			fixtures[fixtureName] = JSON.parse( fs.readFileSync('spec/fixtures/' + fixtureName + '.json') );
			size += fixtures[fixtureName].length;
		}
	}

	for (var fixtureName in fixtures) {
		if (fixtures.hasOwnProperty(fixtureName)) {
			for (var i = 0, fixture; (fixture = fixtures[fixtureName][i]) != null; i++) {
				endtableEngine.saveDocument({type: fixture.type, fields: fixture}, function(error, doc) {
					count++;
					if (count == size) {
						runTestsAsync();
					}
				});
			}
		}
	}
}

function resetDBAndRunTests() {
	endtableEngine.connector.deleteDatabase(function() {
		endtableEngine.connector.createDatabase(function() {
			loadFixtures();
		});
	});
}
resetDBAndRunTests();