var sys = require('sys');

var endtable = require('endtable');
endtableCore = new endtable.Core({
	database: 'people_example'
});

function populateData() {
	var person = new endtable.Object({
		engine: endtableCore,
		type: 'person',
		name: 'Christian',
		age: 28,
		sex: 'male'
	})

	person = new endtable.Object({
		engine: endtableCore,
		type: 'person',
		name: 'Benjamin Coe',
		age: 27,
		sex: 'male'
	})
	person.awesome = true;
	
	person = new endtable.Object({
		engine: endtableCore,
		type: 'person',
		name: 'Sally Johnson',
		age: 24,
		sex: 'female'
	})
	
	person = new endtable.Object({
		engine: endtableCore,
		type: 'person',
		name: 'JBoss',
		age: 30,
		sex: 'male'
	})	
}

function createViews() {
	endtableCore.loadDocument({
		keys: ['name', 'age'],
		type: 'person'
	})
	
	endtableCore.loadDocument({
		keys: ['age'],
		type: 'person'
	});
}

(function resetDatabase(callback) {
	endtableCore.connector.deleteDatabase(function() {
		endtableCore.connector.createDatabase(function() {
			callback();
		});
	});
})(function() {
	createViews();
	populateData();
});

sys.puts('Running... Hit CTRL-C To Exit.');