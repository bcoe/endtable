/**
 * This class is a thin abstraction on top of a connector class.
 * It's used to peform saving/loading operations without knowing the
 * nitty-gritty details of a specific database such as CouchDB.
 */
var sys = require('sys'),
	simpleInheritance = require('./dep/simple-inheritance'),
	arrayHelpers = require('./array-helpers'),
	ErrorHandler = require('./error-handler').ErrorHandler;

exports.Engine = Class.extend({
	
	defaults: {
		port: 5984,
		host: 'localhost',
		user: '',
		legacy: false,
		password: '',
		database: 'development',
		connectorClass: 'couch-connector',
	},
	
	init: function( params ) {
		this.fixCommonTypos(params);
		arrayHelpers.extend(this, this.defaults, params);
		this.errorHandler = this.createErrorHandler(this.errorCallback);
		this.initConnection();
		this.connect();
	},
	
	createErrorHandler: function(errorCallback) {
		var errorHandler = new ErrorHandler();
		if (errorCallback) {
			errorHandler.registerCallback(errorCallback);
		}
		return errorHandler;
	},
	
	fixCommonTypos: function( params ) {
		if (params) {
		
			if (params.username) {
				params.user = params.username;
			}
		
			if (params.pass) {
				params.password = params.pass;
			}
		
			if (params.db) {
				params.database = params.db;
			}
		
		}
	},
	
	initConnection: function() {
		var connectorClass = require('./' + this.connectorClass);
		this.connector = new connectorClass.connector({
			port: this.port,
			host: this.host,
			user: this.user,
			password: this.password,
			database: this.database,
			legacy: this.legacy,
			errorHandler: this.errorHandler
		});
	},
	
	connect: function() {
		this.connector.connect();
	},
	
	loadDocument: function(params, callback) {
		callback = this.errorHandler.wrapCallback(
			callback,
			'Engine',
			'loadDocument',
			params
		);
		
		var _this = this;
		callback = callback || function() {};
		
		this.connector.loadDocument(params, function(error, doc) {
			if (error) {
				if (typeof params == 'object') {
					_this.connector.createView(params, function(error, doc) {
						_this.connector.loadDocument(params, callback);
					});
				} else {
					callback(error, null);
				}
			} else {
				callback(error, doc);
			}
		});
	},
	
	saveDocument: function(params, callback) {
		callback = this.errorHandler.wrapCallback(
			callback,
			'Engine',
			'saveDocument',
			params
		);
		
		this.connector.saveDocument(params, callback);
	}
});