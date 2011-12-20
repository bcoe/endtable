var equal = require('assert').equal,
    puts = require('sys').puts,
	connector = require('../lib/couch-connector').connector,
	endtable = require('../lib');

exports.tests = {
	'should generate a restful URL based on a document id': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}

		c.loadDocument('foobar');
		equal('/foobar', lastUrl, prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should generate a restful URL based on DB and Keys': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			keys: ['name', 'age'],
			type: 'person'
		})
		equal('/_design/person/_view/by_name_age', lastUrl, prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should build a URL with the get parameter descending': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			keys: ['name', 'age'],
			type: 'person',
			descending: true
		})
		equal('/_design/person/_view/by_name_age?descending=true', lastUrl, prefix + ' proper RESTful url not created.');
		finished();
	},

	'should generate a restful URL based on custom view': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			keys: ['name'],
			customView: 'test_view',
			type: 'person'
		})
		equal('/_design/person/_view/custom_test_view', lastUrl, prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should build a URL with the get parameters descending and startkey': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			keys: ['name', 'age'],
			type: 'person',
			descending: true,
			startkey: ['john', '13'],
			endkey: 'foo'
		})
		equal(true, ( lastUrl.indexOf('startkey=%5B%22john%22%2C%2213%22%5D') > 0 ), prefix + ' proper RESTful url not created.');
		equal(true, ( lastUrl.indexOf('descending=true') > 0 ), prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should build a URL with the get parameters startkey_docid and endkey_docid': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			startkey_docid: "foo",
			endkey_docid: "bar"
		})
		equal(true, ( lastUrl.indexOf('startkey_docid=%22foo%22') > 0 ), prefix + ' proper RESTful url not created.');
		equal(true, ( lastUrl.indexOf('endkey_docid=%22bar%22') > 0 ), prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should build a URL with the get paremeters limit and skip': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connection = {
			request: function(url) {
				lastUrl = url;
			}
		}
		c.loadDocument({
			keys: ['name', 'age'],
			type: 'person',
			limit: 1,
			skip: 1
		})
		equal(true, ( lastUrl.indexOf('limit=1') > 0 ), prefix + ' proper RESTful url not created.');
		equal(true, ( lastUrl.indexOf('skip=1') > 0 ), prefix + ' proper RESTful url not created.');
		finished();
	},
	
	'should create an exception if the requested view does not exist': function(finished, prefix) {
		var lastUrl = null;
		c = new connector({
			database: 'test'
		})
		c.connect();
		c.loadDocument({keys: ['name', 'age'], type: 'not_a_person'}, function(error, doc) {
			equal('warn', error.level, prefix + ' error object should not be null');
			finished();
		});
	},
	
	'should create a map function with an if statement filtering by type': function(finished, prefix) {
		var c = createMockConnection();
		c.createView({
			keys: ['name'],
			type: 'person'
		});
		equal(true, lastDocument.views.by_name.map.indexOf('if (doc.type == \'person\') {') > 0, prefix + ' map function not properly created.');
		finished();
	},
	
	'should create a map function with a single value being emitted when a single value is passed in': function(finished, prefix) {
		var c = createMockConnection();
		c.createView({
			keys: ['name'],
			type: 'person'
		})
		equal(true, lastDocument.views.by_name.map.indexOf('emit(doc.name, doc);') > 0, prefix + ' map function not properly created.');

		c.createView({
			keys: 'name',
			type: 'person'
		})
		equal(true, lastDocument.views.by_name.map.indexOf('emit(doc.name, doc);') > 0, prefix + ' map function not properly created.');
		finished();
	},
	
	'should create a map function with an array when multiple keys are provided': function(finished, prefix) {
		var c = createMockConnection();
		c.createView({
			keys: ['name', 'age'],
			type: 'person'
		});
		equal(true, lastDocument.views.by_name_age.map.indexOf('emit([doc.name, doc.age], doc);') > 0, prefix + ' map function not properly created.');
		finished();
	},
	
	'when two createView calls are executed in a row it should add both views to a design': function(finished, prefix) {
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});

		var c = endtableEngine.connector
		
		c.createView({
			keys: ['name', 'type', 'age'],
			type: 'two_views_test'
		});
		
		c.createView({
			keys: ['type', 'name', 'age'],
			type: 'two_views_test'
		});
		var intervalId = setInterval(function() {
			endtableEngine.loadDocument('_design/two_views_test', function(error, doc) {
				if (!doc) return;
				if (typeof doc.views.by_name_type_age == 'object') {
					if (typeof doc.views.by_type_name_age == 'object') {
						clearInterval(intervalId);
						finished();
					}
				};
			});
		}, 50);
	},
	
	'should create the specified map function myFn when createCustomView is called with params customView:myFn': function(finished, prefix) {
		var c = createMockConnection();
		
		var customView = function custom(doc) {
			if(doc.type == 'custom_view_test') {
				emit( toLower(doc.id+'_CUSTOM_TEST'), doc);
			}
		};
		
		var cv_name = customView.name;
		
		c.createCustomView({
			customView:customView,
			type:'custom_view_test'
		});
		
		equal(true, lastDocument.views[c.buildCustomViewName(cv_name)].map.indexOf('_CUSTOM_TEST') > 0, prefix + ' custom map function not properly created.');
		finished();
	},
	
	'should raise an error when createCustomView is called with param customView:myFn that is not a named function': function(finished, prefix) {
		var c = createMockConnection();
		
		var custom_view = function(doc) {
			if(doc.type == 'custom_view_test') {
				emit( toLower(doc.id+'_CUSTOM_TEST'), doc);
			}
		};
		
		c.createCustomView({
			customView:custom_view,
			type:'custom_view_test'
		}, function(error,doc) {
			equal(true,error.message == 'params.customView must be a named function',prefix + 'setting customView to an anonymous function did not raise an error in createCustomView');
			finished();
		});
	},
	
	'should raise an error when createCustomView is called with param custom_view with value that is not a function': function(finished, prefix) {
		var c = createMockConnection();
		
		var cv_name = 'lower_docid';
		
		c.createCustomView({
			customView:'not a function',
			type:'custom_view_test'
		}, function(error,doc) {
			equal(true,error.message == 'params.customView must be a named function',prefix + 'setting custom_view to something other than a function did not raise an error in createCustomView');
			finished();
		});
	}

};


lastDocument = {};
function createMockConnection() {
	var c = new connector({
		database: 'test'
	})
	c.connection = {
		saveDoc: function(documentName, document) {
			lastDocument = document
		},
		getDoc: function(documentName, callback) {
			callback(null, null);
		},
	}
	c.synchronousProcessor = {
		runSynchronous: function(context, callback, arguments) {
			callback.apply(context, arguments);
		}
	}
	return c;
}
