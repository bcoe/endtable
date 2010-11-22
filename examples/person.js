var sys = require('sys');

var endtable = require('endtable');

var engine = new endtable.Engine({
	database: 'people_example',
	legacy: true
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

function populateData() {
	sys.puts('Populating fake data.');
	
	var person = new Person({
		name: 'Christian',
		age: 28,
		sex: 'male'
	}, function(error, obj) {
		sys.puts('Created person.')
	})

	var ben = new Person({
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
		
	setTimeout(function() {
		
		new Person().load({
			keys: 'age',
			startkey: 28,
			endkey: 50
		}, function(error, obj) {
			for (var i = 0; i < obj.length; i++) {
				obj[i].sayName();
			}
		})
		
	}, 1000);
}

function performQuery() {
	sys.puts('Performing query.');
	
	engine.loadDocument({
		keys: ['name', 'age'],
		type: 'person'
	})
	
	engine.loadDocument({
		keys: ['age'],
		type: 'person'
	});
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
	sys.puts('Running... Hit CTRL-C To Exit.');
});