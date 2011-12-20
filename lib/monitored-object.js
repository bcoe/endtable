/**
 * An object that monitors itself for dirty-ness automatically
 * persisting back to a key/value store at a set rate. 
 */
var sys = require('sys'),
	simpleInheritance = require('./dep/simple-inheritance'),
	arrayHelpers = require('./array-helpers');

var localUID = 0;

var MonitoredObject = Class.extend({
	defaults: {
		_dirty: false,
		checkNewRate: 100,
		saveRate: 100,
		engine: null,
		instanceVariables: null,
		customViews: null,
		localUID: 0,
		params: {},
		synchronousProcessor: null,
		Constructor: null,
		errorHandler: null,
		validators: null,
		errorCallback: null,
		firstSaveCallback: null,
		dontPersist: false
	},
	
	init: function(params) {
		this.localUID = localUID++;
		arrayHelpers.extend(this, this.defaults, params);
	
		this.validators = {};
		this.loadValidators();

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
	
	loadValidators: function() {
		for (var key in this) {
			if ( ( typeof this[key] == 'function' || arrayHelpers.isArray(this[key]) ) && key.indexOf('validates') != -1) {
				
				if (typeof this[key] == 'function') {
					this[key] = [this[key]];
				}
				
				validatorKey = key.substr( 'validates'.length ).toLowerCase()
						
				this.validators[validatorKey] = [];
				for (var i = 0; i < this[key].length; i++) {
					this.validators[validatorKey].push(this[key][i]);
				}
				
			}
		}
	},
	
	checkForModifiedArray: function(key) {
		if (arrayHelpers.isArray(this[key]) ) {
			if (this[key].hash != arrayHelpers.hashArray(this[key])) {
				this[key] = this.wrapArraysAndObjectsInArray(this[key]);
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
	
	wrapArraysAndObjectsInArray: function(array) {
		for (var i = 0; i < array.length; i++) {
			if (arrayHelpers.isArray(array[i])) {
				array[i] = this.wrapArraysAndObjectsInArray(array[i]);
			} else if (typeof array[i] == 'object' && !array[i].localUID) {
				array[i] = this.wrapArraysAndObjects(array[i]);
			}
		}
		return array;
	},
	
	wrapArraysAndObjects: function(value) {
		var _this = this;
		
		if ( arrayHelpers.isArray(value) ) {
			this.wrapArraysAndObjectsInArray(value);
			value.hash = arrayHelpers.hashArray(value);
		} else if ( typeof value == 'object') {
			
			value.dirty = function() {
				_this.dirty();
			}
			
			value = new MonitoredObject(value);
		}	
		
		return value;
	},

	defineGetterAndSetter: function(key) {
		
		this.__defineGetter__(key, function() {
			return this['_' + key];
		});
		
		this.__defineSetter__(key, function(value) {
			if (this.applyValidators(key, value)) {
				this.instanceVariables[key] = value;
				this['_' + key] = value;
				this.dirty();
			} else {
				this.raiseValidationError(key, value);
			}
		});
	},
	
	applyValidators: function(key, value) {
		var validators = this.validators[key];
		if (validators) {
			for (var i = 0; i < validators.length; i++) {
				if ( !validators[i](value) ) {
					return false;
				}
			}
		}
		return true;
	},
	
	raiseValidationError: function(key, value) {
		error = {};
		error.error = 'validation';
		error.reason = 'validator failed';
		error.raisedByObject = 'MonitoredObject';
		error.raisedByMethod = 'defineGetterAndSetter';
		error.raisedByParameters = {key: key, value: value};
		this.errorHandler.handleError(error);	
	},
	
	dirty: function() {
		if (this.dontPersist) {
			return;
		}
		
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
				if (arrayHelpers.isArray(this.instanceVariables[key])) {
					params[key] = this.serializeArray(this.instanceVariables[key]);
				} else if (typeof this.instanceVariables[key] == 'object' && this.instanceVariables[key].instanceVariables) {
					params[key] = this.instanceVariables[key].serialize();
				} else {
					params[key] = this.instanceVariables[key];
				}
			}
		}
		return params;
	},
	
	serializeArray: function(array) {
		var serializedArray = [];
		for (var i = 0; i < array.length; i++) {
			if (arrayHelpers.isArray(array[i])) {
				serializedArray[i] = this.serializeArray(array[i]);
			} else if (typeof array[i] == 'object' && array[i].instanceVariables) {
				serializedArray[i] = array[i].serialize();
			} else {
				serializedArray[i] = array[i];
			}
		}
		return serializedArray;
	}
});

exports.MonitoredObject = MonitoredObject;
