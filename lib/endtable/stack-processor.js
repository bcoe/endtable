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
		processRate: 20,
		processStack: []
	},
	
	init: function(params) {
		arrayHelpers.extend(this, this.defaults, params);
		this.process();
	},
	
	runLater: function(context, func, arguments) {
		var executeLater = {
			context: context,
			func: func,
			arguments: arguments
		}
		this.processStack.push(executeLater);
	},
	
	process: function() {
		var _this = this;
		setTimeout(function() {
			if (_this.processStack.length) {
				var execute = _this.processStack.pop();
				execute.func.apply(execute.context, execute.arguments);
			}
			_this.process();
		}, this.processRate);
	}
});