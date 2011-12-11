var equal = require('assert').equal,
	puts = require('sys').puts,
	errorHandler = require('../lib/error-handler'),
	endtable = require('../lib');

exports.tests = {
	'should register a callback that will be executed when an error is raised in the system': function(finished, prefix) {
		var handlerCalled = false
		var eh = new errorHandler.ErrorHandler();
	
		eh.registerCallback(function() {
			handlerCalled = true
		});
		eh.handleError({})
		equal(handlerCalled, true, prefix);
		finished();
	},
	
	'should be called when an endtable engine is initialized with the parameter errorCallback': function(finished, prefix) {
		var handlerCalled = false
		
		var endtableEngine = new endtable.Engine({
			errorCallback: function() {
				handlerCalled = true
			}
		})
		
		endtableEngine.errorHandler.handleError({})
		equal(handlerCalled, true, prefix);
		finished();
	}
}