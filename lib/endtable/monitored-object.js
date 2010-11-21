/**
 * An object that monitors itself for dirty-ness automatically
 * persisting back to a key/value store at a set rate. 
 */
require.paths.unshift(__dirname);
var sys = require('sys');
var simpleInheritance = require('../dep/simple-inheritance');
var arrayHelpers = require('array-helpers');

var localUID = 0;

var MonitoredObject = Class.extend({
	defaults: {
		_dirty: false,
		checkNewRate: 250,
		engine: null,
		instanceVariables: null,
		saveRate: 250,
		localUID: 0,
		params: {},
		synchronousProcessor: null
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
	},
	
	serialize: function() {
		var params = {};
		for (var key in this.instanceVariables) {
			if (this.instanceVariables.hasOwnProperty(key) && typeof this.instanceVariables[key] != 'function') {
				if (typeof this.instanceVariables[key] == 'object' && this.instanceVariables[key].instanceVariables) {
					params[key] = this.instanceVariables[key].serialize();
				} else {
					params[key] = this.instanceVariables[key];
				}
			}
		}
		return params;
	}
});

exports.MonitoredObject = MonitoredObject;