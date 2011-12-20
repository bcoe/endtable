var sys = require('sys');
sys.puts('Running... Hit CTRL-C To Exit.');

var endtable = require('../lib');

var engine = new endtable.Engine({
	database: 'custom_view_example',
	host: 'localhost',
	user: '',
	password: '',
	errorCallback: function(error) {
		// When views aren't found they raise a warning.
		sys.puts(JSON.stringify(error));
	}
});

// We define a Person with a custom view
var Person = endtable.Object.extend(
	{
		sayName: function() {
			sys.puts('Hello, my name is ' + this.name + '!');
		},
		sayAge: function() {
			sys.puts(this.name + ': age=' + this.age);
		}
	},
	{
		engine: engine,
		type: 'person',
		customViews: [
			function lowerName(doc) {
				if(doc.type == 'person') { emit(doc.name.toLowerCase(), doc); }
			},
			function ageInDays(doc) {
				if(doc.type == 'person') { emit(doc.age*365.25, doc); }
			}
		]
	}
);

function populateData() {
	var ben = new Person({
		name: 'Benjamin Coe',
		age: 27,
		sex: 'male'
	});

	var christian = new Person({
		name: 'Christian',
		age: 28,
		sex: 'male'
	}, function(error, obj) {
		sys.puts('Created Christian.')
	});

	var person = new Person({
		name: 'Sally Johnson',
		age: 24,
		sex: 'female'
	});
	
	person = new Person({
		name: 'JBoss',
		age: 30,
		sex: 'male'
	});
}

function performQuery() {
	setTimeout(function() {
		
		sys.puts('Performing query.');

		// suppose we only have a range of age in days to filter people
		var startAge = 10227;
		var endAge = 18262.5;

		Person.load({
			keys: 'age',
			startkey: startAge,
			endkey: endAge,
			customView: 'ageInDays'
		}, function(error, obj) {
			if (!error) {
				for (var i = 0; i < obj.length; i++) {
					obj[i].sayAge();
				}
			}
		});
		
		setTimeout(function() {
		// suppose we have want people have unique names, case-insensitive
		// if we were making a new Person we would first check to see if their
		// name in lowercase matches any existing person's name (ignoring case)
		Person.load({
			keys: 'name',
			key: 'jboss', // note this is lowercase, but it will still match the person with name JBoss
			customView: 'lowerName'
		}, function(error, obj) {
			if (!error) {
				for (var i = 0; i < obj.length; i++) {
					// if they say their name, someone with that name exists already
					obj[i].sayName();
				}
			}
		});

		}, 500);
		
	}, 1000);
}

(function resetDatabase(callback) {
	sys.puts('Resetting database.'); 
	engine.connector.deleteDatabase(function() {
		engine.connector.createDatabase(function(error, doc) {
			callback();
		});
	});
})(function() {
	populateData();
	performQuery();
});
