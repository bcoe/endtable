/**
 * The Mapper-Backed Object at the heart of Endtable.
 */
require.paths.unshift(__dirname);
var sys = require('sys');
var simpleInheritance = require('../dep/simple-inheritance');
var MonitoredObject = require('monitored-object').MonitoredObject;
var arrayHelpers = require('array-helpers');

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
				if (!error) {
					_this.instanceVariables._rev = doc.rev;
					_this.instanceVariables._id = doc.id;
				}
			}
		);
	}
});