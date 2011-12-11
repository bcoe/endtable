var equal = require('assert').equal,
	puts = require('sys').puts,
	endtable = require('../lib');
	
var SAVE_FREQUENCY = 20; // How often are objects auto-saved?

exports.tests = {
	'should fire a callback when a new object is created': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		function createCallback() {
			var endtableObject = new endtable.Object({
				engine: endtableEngine,
				type: 'person',
				name: 'Jane',
				age: 24
			}, function() {
				finished();
			});
		}
		
		resetDatabase(endtableEngine, {keys: 'name', type: 'person', name: 'Jane'}, function() {
			createCallback();
		});
	},
	
	'should save a new object when created': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		function saveNewObject() {
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
		}
		
		resetDatabase(endtableEngine, {keys: 'name', type: 'person', key: 'John Doe'}, function() {
			saveNewObject();
		});
	},

	'should re-save new objects when instance variables are added': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		function resaveObject() {
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
				}, 500);
			});
			
			setTimeout(function() {
				endtableObject.brain = 'big';
			}, 300);
		}
		
		resetDatabase(endtableEngine, {keys: 'name', type: 'person', key: 'Bob Yewchuck'}, function() {
			resaveObject();
		});
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
		}, 500);
	}
};

function resetDatabase(endtableEngine, params, callback) {
	endtableObject = new endtable.Object({
		engine: endtableEngine
	}).load(params, function(error, objs) {
		var count = 0;
		
		if (!objs || !objs.length) {
			callback();
			return;
		};
		
		for (var i = 0, obj; (obj = objs[i]) != null; i++) {
			obj.delete(function() {
				count += 1;
				if (count == objs.length) {
					callback();
				}
			});
		}
	});
};