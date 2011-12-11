var sys = require('sys');
sys.puts('Running... Hit CTRL-C To Exit.');

var endtable = require('../lib');

var engine = new endtable.Engine({
	database: 'people_example',
	host: 'localhost',
	user: '',
	password: '',
	errorCallback: function(error) {
		// When views aren't found they raise a warning.
		sys.puts(JSON.stringify(error));
	}
});

var Person = endtable.Object.extend(
	{
		sayName: function() {
			sys.puts('Hello, my name is ' + this.name + '!');
		}
	},
	{
		engine: engine,
		type: 'person'
	}
);

var Dog = endtable.Object.extend(
	{
		bark: function() {
			sys.puts('Woof!!!');
		}
	},
	{
		engine: engine,
		type: 'dog'
	}
);

function populateData() {
	sys.puts('Populating fake data.');
	
	var christian = new Person({
		name: 'Christian',
		age: 28,
		sex: 'male'
	}, function(error, obj) {
		sys.puts('Created person.')
	})
	
	setTimeout(function() {
		christian.age = 29;
	}, 2000);

	var dog = new Dog({
		name: 'Spike',
		owner: 'Benjamin Coe',
		coat: 'soft'
	})

	var ben = new Person({
		name: 'Benjamin Coe',
		age: 27,
		sex: 'male',
		interests: ['climbing']
	})
	
	setTimeout(function() {
		ben.awesome = true;
	}, 3050);
	
	setTimeout(function() {
		ben.interests.push('programming');
	}, 500);
	
	person = new Person({
		name: 'Sally Johnson',
		age: 24,
		sex: 'female'
	})
	
	person = new Person({
		name: 'JBoss',
		age: 30,
		sex: 'male'
	})
}

function performQuery() {
	setTimeout(function() {
		
		sys.puts('Performing query.');

		Person.load({
			keys: 'age',
			startkey: 28,
			endkey: 50
		}, function(error, obj) {
			if (!error) {
				for (var i = 0; i < obj.length; i++) {
					obj[i].sayName();
				}
			}
		})
		
		Dog.load({
			keys: ['owner', 'coat'],
			key: ['Benjamin Coe', 'soft']
		}, function(error, obj) {
			if (!error) {
				obj[0].bark();
			}
		})
		
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