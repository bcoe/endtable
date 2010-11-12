/**
 * A Simple mapper built on top of CouchDB designed to
 * store validation and other semantic information within the
 * couch documents themselves.
 */

require.paths.unshift(__dirname);
var sys = require('sys');
var simpleInheritance = require('../dep/simple-inheritance');
var arrayHelpers = require('array-helpers');

exports.Core = Class.extend({
	
	defaults: {
		port: 5984,
		host: 'localhost',
		user: '',
		password: '',
		database: 'development',
		connectorClass: 'couch-connector',
	},
	
	init: function( params ) {
		arrayHelpers.extend(this, this.defaults, params);
		this.initConnection();
		this.connect();
	},
	
	initConnection: function() {
		var connectorClass = require(this.connectorClass);
		this.connector = new connectorClass.connector({
			port: this.port,
			host: this.host,
			user: this.user,
			password: this.password,
			database: this.database
		});
	},
	
	connect: function() {
		this.connector.connect();
	},
	
	loadDocument: function(params, callback) {
		var _this = this;
		callback = callback || function() {};

		this.connector.loadDocument(params, function(error, doc) {
			if (error && error.error == 'not_found') {
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
		this.connector.saveDocument(params, callback);
	}
});

exports.Object = Class.extend({
	defaults: {
		
	},
	
	init: function(params) {
		arrayHelpers.extend(this, this.defaults, params);
	},
	
	load: function(params, callback) {
		var _this = this;
		this.loadCallback = callback;
		this.engine.loadDocument(params, function(error, doc) {
			_this.loadDocumentCallback(error, doc);
		});
	},
	
	loadDocumentCallback: function(error, doc) {
		if (!error) {
			this.loadFromDocument(doc);
		}
	},
	
	loadFromDocument: function(doc) {
		var loadReturn = this;
		if (doc.rows.length != 1) {
			loadReturn = [];
		}
		
		for (var i = 0, row; (row = doc.rows[i]) != null; i++) {
			if (doc.rows.length == 1) {
				this.loadFromRow(row);
			} else {
				
			}
		}
		
		this.loadCallback(loadReturn);
	},
	
	loadFromRow: function(row) {
		for (var key in row.value) {
			if (row.value.hasOwnProperty(key)) {
				this[key] = row.value[key];
			}
		}
	}
});