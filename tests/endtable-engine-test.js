var equal = require('assert').equal,
	puts = require('sys').puts,
	endtable = require('../lib');

exports.tests = {
	'should extend base object with defaults': function(finished, prefix) {
		var endtableEngine = new endtable.Engine();
		equal('development', endtableEngine.database, prefix + ' engine not initialized with default values.');
		finished();
	},
	
	'should overwrite defaults with params': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			host: '127.0.0.1',
			database: 'production'
		});
		equal('production', endtableEngine.database, prefix + ' params did not overwrite defaults.');
		equal('127.0.0.1', endtableEngine.host, prefix + ' params did not overwrite defaults.');
		finished();
	},
	
	'should create a view if one does not exist': function(finished, prefix) {
		var createViewCalled = false,
			endtableEngine = new endtable.Engine();
			
		endtableEngine.connector = {
			loadDocument: function(params, callback) {
				callback({
					error: 'not_found'
				})
			},
			createView: function(params, callback) {
				createViewCalled = true
			}
		}

		endtableEngine.loadDocument({
			keys: ['name', 'age'],
			type: 'person',
			descending: true
		});
	
		equal(true, createViewCalled, prefix + ' missing view was not created.');
		finished();
	},
	
	'should update an existing design with a new view': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var c = endtableEngine.connector;
	
		// Create the first view of the data.
		endtableEngine.loadDocument({
			keys: ['age', 'name'],
			type: 'update_view_test'
		}, function(error, doc) {

			// Create the second view of the data.
			endtableEngine.loadDocument({
				keys: 'age',
				type: 'update_view_test'
			}, function() {
		
				// Examine the design created.
				endtableEngine.loadDocument('_design/update_view_test', function(error, doc) {
					if (typeof doc.views.by_age_name == 'object') {
						if (typeof doc.views.by_age == 'object') {
							finished();
						}
					}
				});
		
			})
		});
	},
	
	'should save a document to couch with the appropriate fields': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var c = endtableEngine.connector;
	
		endtableEngine.saveDocument({
			type: 'person',
			fields: {
				'name': 'Benjamin Coe',
				'age': 28
			}
		}, function(error, doc) {
			endtableEngine.loadDocument(doc.id, function(error, doc) {
				equal('Benjamin Coe', doc.name, prefix + ' name not set.');
				equal(28, doc.age, prefix + ' age not set.');
				finished();
			});
		});
	}
}