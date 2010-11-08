require.paths.unshift(__dirname);
require('./lib/jspec');

var fs = require('fs');
var endtable = require('endtable');
EndtableCore = endtable.EndtableCore;
EndtableObject = endtable.EndtableObject;
connector = require('../lib/endtable/couch-connector');

var endtableCore = new EndtableCore({
	port: 5984,
	host: 'localhost',
	user: '',
	password: '',
	database: 'test'
});

/**
 * Run tests after a setTimeout which allows asynchronous
 * tests time to complete.
 */
function runTestsAsync() {
	specs = {
		independant: [
	    	'endtable-core',
			'couch-connector'
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
		}, 1000);
		
		JSpec.run()
	}
}

function loadFixtures() {
	var people = JSON.parse( fs.readFileSync('spec/fixtures/people.json') );
	var size = people.length;
	var count = 0;
	for (var i = 0, person; (person = people[i]) != null; i++) {
		endtableCore.saveDocument({type: 'person', fields: person}, function() {
			count++;
			if (count == size) {
				runTestsAsync();
			}
		});
	}
}

function resetDBAndRunTests() {
	endtableCore.connector.deleteDatabase(function() {
		endtableCore.connector.createDatabase(function() {
			loadFixtures();
		});
	});
}
resetDBAndRunTests();