var sys = require('sys');

var endtable = require('endtable');
endtableCore = new endtable.Core({
	database: 'people_example'
});

var Person = endtable.Object.extend({
	init: function(params) {
		this._super(params);
	},
	
	sayName: function() {
		sys.puts('Hello, my name is ' + this.name + '!');
	}
});

function populateData() {
	sys.puts('Populating fake data.');
	
	var person = new Person({
		engine: endtableCore,
		type: 'person',
		name: 'Christian',
		age: 28,
		sex: 'male'
	}, function(error, obj) {
		sys.puts('Created person.')
	})

	var ben = new Person({
		engine: endtableCore,
		type: 'person',
		name: 'Benjamin Coe',
		age: 27,
		sex: 'male',
		interests: ['climbing']
	})
	
	setTimeout(function() {
		ben.awesome = true;
	}, 250);
	
	setTimeout(function() {
		ben.interests.push('programming');
		ben.sayName();
	}, 500);
	
	person = new Person({
		engine: endtableCore,
		type: 'person',
		name: 'Sally Johnson',
		age: 24,
		sex: 'female'
	})
	
	person = new Person({
		engine: endtableCore,
		type: 'person',
		name: 'JBoss',
		age: 30,
		sex: 'male'
	})	
}

function performQuery() {
	sys.puts('Performing query.');
	
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
	sys.puts('Resetting database.'); 
	endtableCore.connector.deleteDatabase(function() {
		endtableCore.connector.createDatabase(function() {
			callback();
		});
	});
})(function() {
	populateData();
	performQuery();
	sys.puts('Running... Hit CTRL-C To Exit.');
});