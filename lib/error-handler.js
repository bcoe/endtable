/**
 * You can register a central error handler with
 * endtable to allow you to deal with exceptions raised
 * by automated parts of the system, e.g., the automatic
 * saving.
 *
 * This is where you'll want to be hooking in logging.
 */
var sys = require('sys'),
	simpleInheritance = require('./dep/simple-inheritance'),
	arrayHelpers = require('./array-helpers');

var ErrorHandler = Class.extend({
	defaults: {
	},
	
	init: function(params) {
		arrayHelpers.extend(this, this.defaults, params);
	},
	
	registerCallback: function(callback) {
		this.errorCallback = callback;
	},
	
	/**
	 * An error object is created with the following structure:
	 * {
	 *		error: the error raised.
	 *		reason: the reason for the error.
	 *		raisedByObject: the object in endtable that raised this error.
	 *		raisedByMethod: the method in endtable that raised this error.
	 *		raisedByParameters: the parameters in endtable that raised this error.
	 *		level: {'warn', 'error'} how critical was this error?
	 * }
	 */
	handleError: function( error ) {
		if (this.errorCallback) {
			this.errorCallback(error);
		}
	},
	
	wrapCallback: function(callback, raisedByObject, raisedByMethod, raisedByParameters, level) {
		var _this = this;
		level = level || 'error';
		
		return function(error, doc) {
			if (error) {
				error.raisedByObject = raisedByObject;
				error.raisedByMethod = raisedByMethod;
				error.raisedByParameters = raisedByParameters;
				error.level = level;
				_this.handleError( error );
			}
			
			if (callback) {
				callback(error, doc);
			}
		}
	}
});

exports.ErrorHandler = ErrorHandler;