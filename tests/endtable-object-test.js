var equal = require('assert').equal,
	puts = require('sys').puts,
	endtable = require('../lib');

exports.tests = {
	'should fire a callback when a new object is created': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var endtableObject = new endtable.Object({
			engine: endtableEngine,
			type: 'person',
			name: 'Jane',
			age: 24
		}, function() {
			finished();
		});
	},
	
	'should save a new object when created': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		endtableObject = new endtable.Object({
			engine: endtableEngine,
			type: 'person',
			name: 'John Doe',
			age: 75
		}, function() {
			endtableObject = new endtable.Object({
				engine: endtableEngine
			}).load({
				keys: 'name',
				type: 'person',
				key: 'John Doe'
			}, function(error, obj) {
				equal('John Doe', obj[0].name, prefix + ' object not saved.');
				equal(75, obj[0].age, prefix + ' object not saved.');
				finished();
			});
		});
	},

	'should re-save new objects when instance variables are added': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var endtableObject = new endtable.Object({
			engine: endtableEngine,
			type: 'person',
			name: 'Bob Yewchuck',
			age: 99
		}, function(err, _this) {
			setTimeout(function() {
				var loadedObject = new endtable.Object({
					engine: endtableEngine
				}).load({
					keys: 'name',
					type: 'person',
					key: 'Bob Yewchuck'
				}, function(error, obj) {
					equal('big', obj[0].brain, prefix + ' object was not updated with new key.');
					finished();
				});
			}, 250);
		});
		
		setTimeout(function() {
			endtableObject.brain = 'big';
		}, 50);
	},
	
	'should save an object when a new element is added to an array': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var person = new endtable.Object({
			engine: endtableEngine,
			saveRate: 500000,
			dependentArray: [],
			type: 'person',
			name: 'Ben',
			age: 27
		});
		person._dirty = false;
		person.dependentArray.push('hello');
		
		setTimeout(function() {
			equal(true, person._dirty, prefix + ' updating array did not dirty object.');
			finished();
		}, 300);
	},
	
	"should save an object when an item is changed in an object in an array that's in an array": function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var person = new endtable.Object({
			engine: endtableEngine,//fixing.
			saveRate: 500000,
			dependentArray: ['apple', ['banana', {'pineapple' : 'apple'}]],
			type: 'person',
			name: 'Ben',
			age: 27
		});
		person._dirty = false;
		person.dependentArray[1][1].pineapple = 'tasty';
	
		setTimeout(function() {
			equal(true, person._dirty, prefix);
			finished();
		}, 300);
	},
	
	"should load an object when the _id parameter is set": function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend(
			{
			},
			{
				engine: endtableEngine,
				type: 'person'
			}
		);
		
		new Person({
			'name': 'Benjamin',
			'age': 28
		}, function(err, doc) {
			Person.load({
				keys: '_id',
				key: doc.id
			}, function(err, person) {
				equal(1, person.length, prefix);
				equal(28, person[0].age, prefix);
				finished()
			});
		});
	},
	
	'should save a loaded object when its instance variables are updated': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend(
			{
			},
			{
				engine: endtableEngine,
				type: 'person'
			}
		);
		
		new Person({
			name: 'Revision Test'
		}, function() {
			
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Revision Test'
			}, function(error, obj) {
				
				obj[0].blarg = 'blarg'
				
				setTimeout(function() {
					endtableObject = Person.load({
						keys: 'name',
						key: 'Revision Test'
					}, function(err, person) {
						equal(person[0].blarg, 'blarg', prefix);
						finished();
					});
				}, 300);
			});
			
		});
	},
	
	'should populate an objects instance variables with fields from key/value store': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Mark Twain',
			age: 293
		}, function() {
			
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Mark Twain'
			}, function(error, obj) {
				equal(obj[0].age, 293, prefix);
				finished();
			});
		});
	},
	
	'should return an array of objects if a query would return multiple results': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Mark Twain',
			age: 293
		}, function() {
			new Person({
				name: 'Ben Coe',
				age: 28
			}, function() {
				Person.load({
					keys: 'age',
					startkey: 20,
					endkey: 400
				}, function(err, obj) {
					equal(obj.length, 2, prefix);
					finished();
				});
			});
		});
	},
	
	'should return an instance of an extending endtable class if an endtable object is sub-classed': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend(
			{
				extendedClass: function() {
					return true;
				}
			},
			{
				engine: endtableEngine,
				type: 'person'
			}
		);
		
		new Person({
			name: 'Ben'
		}, function() {
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Ben'
			}, function(error, obj) {
				equal(obj[0].extendedClass(), true, prefix);
				finished();
			});
		});
	},
	
	'should let you delete a single document': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Ben'
		}, function() {
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Ben'
			}, function(error, obj) {
				obj[0].delete();
				var endtableObject = Person.load({
					keys: 'name',
					key: 'Ben'
				}, function(error, obj) {
					equal(obj.length, 0, prefix);
					finished();
				});
			});
		});
	},
	
	'should set a dirty flag on the object when an instance variable is added': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Ben'
		}, function() {
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Ben'
			}, function(error, obj) {
				obj[0].saveRate = 500000;
				obj[0]._dirty = false;
				obj[0].newKey = 'snuh';
				setTimeout(function() {
					equal(obj[0]._dirty, true, prefix);
					finished();
				}, 300);
			});
		});
	},
	
	'should set a dirty flag on the object when an instance variable is updated': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Ben',
			age: 23
		}, function() {
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Ben'
			}, function(error, obj) {
				obj[0].saveRate = 500000;
				obj[0]._dirty = false;
				obj[0].age = 24;
				setTimeout(function() {
					equal(obj[0]._dirty, true, prefix);
					finished();
				}, 300);
			});
		});
	},
	
	'should automatically persist an object to couch if it has been dirtied': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var Person = endtable.Object.extend({}, {engine: endtableEngine, type: 'person'});
		
		new Person({
			name: 'Ben'
		}, function() {
			var endtableObject = Person.load({
				keys: 'name',
				key: 'Ben'
			}, function(error, obj) {
				obj[0].newKey = 'snuh';
				setTimeout(function() {
					var endtableObject = Person.load({
						keys: 'name',
						key: 'Ben'
					}, function(error, obj) {
						equal(obj.length, 1, prefix);
						equal(obj[0].newKey, 'snuh', prefix);
						finished();
					});
				}, 300);
			});
		});
	},

	'should use custom view to load objects': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});	
	
		var Person = endtable.Object.extend({}, 
			{
				engine: endtableEngine,
				type: 'person',
				customViews: [
					function matchesA(doc) {if(doc.type=='person'){emit('a',doc);}}
				]
			}
		);
		
		new Person({
			name: 'Mark Twain',
			age: 293
		}, function() {
			new Person({
				name: 'Tom Sawyer',
				age: 13
			}, function() {
		
				Person.load(
					{
						keys: 'name',
						key: 'a',
						customView: 'matchesA'
					},
					function (error,obj) {
						if(!error) {
							equal(true,obj.length==2,prefix);
							finished();
						}
					}
				);
			});
		});
	}

};
