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

var localUID = 0;
var MonitoredObject = Class.extend({
	defaults: {
		_dirty: false,
		checkNewRate: 250,
		engine: null,
		instanceVariables: null,
		saveRate: 250,
		localUID: 0
	},
	
	init: function(params) {
		this.localUID = localUID++;
		arrayHelpers.extend(this, this.defaults, params);
		this.instanceVariables = {};
		this.checkForNewInstanceVariables();
	},
	
	checkForNewInstanceVariables: function() {
		var _this = this;
		for (var key in this) {
			if (this.hasOwnProperty(key) && !this.defaults.hasOwnProperty(key) && key.charAt(0) != '_' && !this.instanceVariables[key] && typeof this[key] != 'function') {
				var value = this[key];
				delete this[key];
				this.addNewInstanceVariable(key, value);
				this.dirty();
			}
			this.checkForModifiedArray(key);
		}
		
		setTimeout(function() {
			_this.checkForNewInstanceVariables();
		}, this.checkNewRate);
	},
	
	checkForModifiedArray: function(key) {
		if (arrayHelpers.isArray(this[key]) ) {
			if (this[key].hash != arrayHelpers.hashArray(this[key])) {
				this[key].hash = arrayHelpers.hashArray(this[key]);
				this.dirty();
			}
		}
	},
	
	addNewInstanceVariable: function(key, value) {
		value = this.wrapArraysAndObjects(value);
		this.instanceVariables[key] = value;
		this['_' + key] = value;
		this.defineGetterAndSetter(key);
	},
	
	wrapArraysAndObjects: function(value) {
		var _this = this;
		
		if ( arrayHelpers.isArray(value) ) {
			value.hash = arrayHelpers.hashArray(value);
		} else if ( typeof value == 'object') {
			value = new MonitoredObject(value);
			value.dirty = function() {
				_this.dirty();
			}
		}	
		
		return value;
	},

	defineGetterAndSetter: function(key) {
		this.__defineGetter__(key, function() {
			return this['_' + key];
		});
		
		this.__defineSetter__(key, function(value) {
			this.instanceVariables[key] = value;
			this['_' + key] = value;
			this.dirty();
		});
	},
	
	dirty: function() {
		var _this = this;
		if (!this._dirty) {
			this._dirty = true;
			setTimeout(function() {
				_this._dirty = false;
				_this.save();
			}, this.saveRate);
		}
	},
	
	save: function() {
	// This is 'abstract'.
	}
});

exports.Object = MonitoredObject.extend({
	
	init: function(params) {
		this._super(params);
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
		} else {
			this.loadCallback(error, null);
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
		
		this.loadCallback(null, loadReturn);
	},
	
	loadFromRow: function(row) {
		for (var key in row.value) {
			if (row.value.hasOwnProperty(key)) {
				this.addNewInstanceVariable(key, row.value[key]);
			}
		}
	},
	
	save: function() {
		var _this = this;
		var params = {};
		for (var key in this.instanceVariables) {
			if (this.instanceVariables.hasOwnProperty(key) && typeof this.instanceVariables[key] != 'function') {
				params[key] = this.instanceVariables[key];
			}
		}
		
		this.engine.saveDocument(
			{
				type: this._type,
				fields: params
			},
			function(error, doc) {
				if (!_this.instanceVariables._id && doc) {
					_this.instanceVariables._rev = doc.rev;
					_this.instanceVariables._id = doc.id;
				}
			}
		);
	}
});