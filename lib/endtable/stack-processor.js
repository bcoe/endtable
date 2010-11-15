/**
 * Used to force some operations to be executed
 * synchronously -- use sparingly.
 */
require.paths.unshift(__dirname);
var sys = require('sys');
var simpleInheritance = require('../dep/simple-inheritance');
var arrayHelpers = require('array-helpers');

exports.StackProcessor = Class.extend({
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
				var execute = _this.processStack[_this.processStack.length - 1];
				execute.func.apply(execute.context, execute.arguments);
			} else {
				setTimeout(_process, _this.processRate);
			}	
		}
		
		setTimeout(_process, this.processRate);
	},
	
	next: function() {
		this.processStack.pop();
		this.process();
	}
});