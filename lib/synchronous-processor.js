/**
 * Used to force some operations to be executed
 * synchronously -- use sparingly.
 */
var sys = require('sys'),
	simpleInheritance = require('./dep/simple-inheritance'),
	arrayHelpers = require('./array-helpers');

exports.SynchronousProcessor = Class.extend({
	defaults: {
		processRate: 20
	},
	
	init: function(params) {
		arrayHelpers.extend(this, this.defaults, params);
		this.processStack = [];
		this.process();
	},
	
	runSynchronous: function(context, func, arguments) {
		var executeLater = {
			context: context,
			func: func,
			arguments: arguments
		}
		this.processStack.push(executeLater);
	},
	
	process: function() {
		var _this = this;
		
		var _process = function() {
			if (_this.processStack.length) {
				var execute = _this.processStack[0];
				execute.func.apply(execute.context, execute.arguments);
			} else {
				setTimeout(_process, _this.processRate);
			}	
		}
		
		setTimeout(_process, this.processRate);
	},
	
	next: function() {
		this.processStack.shift();
		this.process();
	}
});