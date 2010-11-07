/**
 * An interface for connecting to a document store
 * such as Couch.
 */
require.paths.unshift(__dirname);
var sys = require('sys');
var connect = require('connect');
var couchdb = require('../dep/couchdb');
var simpleInheritance = require('../dep/simple-inheritance');
var arrayHelpers = require('array-helpers');

exports.connector = Class.extend({
	
	init: function(params) {
		arrayHelpers.extend(this, {}, params);
	},
	
	connect: function() {
		this.connection = couchdb
		    .createClient(this.port, this.host, this.user, this.password)
		    .db(this.database);
	},
	
	loadDocument: function(params, callback) {
		var defaults = {
			startKey: false,
			endKey: false,
			descending: false,
			limit: false,
			type: '',
			keys: []
		}
		params = arrayHelpers.extend(defaults, {}, params);
				
		var viewURL = this.buildViewURL(params.keys, params.type);
		
		var viewParams = this.buildViewParams({
			startKey: params.startKey,
			endKey: params.endKey,
			descending: params.descending,
			limit: params.limit
		});
		
		this.connection.request(viewURL + viewParams, callback);
	},
	
	buildViewURL: function(keys, type) {
		return '/_view/' + type + '/' + this.buildViewName(keys);
	},
	
	buildDocumentName: function(type) {
		return '_design/' + type;
	},
	
	buildViewName: function(keys) {
		var viewName = 'by';
		
		if (typeof keys == 'string') {
			keys = [keys];
		}
				
		for (var i = 0, key; (key = keys[i]) != null; i++) {
			viewName += '_' + key;
		}
		
		return viewName;
	},
	
	buildViewParams: function(getParams) {
		var i = 0;
		var getParamsString = '';
		for (var key in getParams) {
			if (getParams.hasOwnProperty(key) && getParams[key]) {
				if (i) {
					getParamsString += '&';
				}
				
				getParamsString += encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(getParams[key]))
				
				i++;
			}
		}
		
		return getParamsString.length ? '?' + getParamsString : '';
	},
	
	createView: function(params, callback) {
		var _this = this;
		var doc = {views: {}};
		
		var documentName = this.buildDocumentName(params.type);
		this.connection.getDoc(documentName, function(error, doc) {
			
			if (!doc) {
				doc = {views: {}};
			}
			
			doc.views[_this.buildViewName(params.keys)] = {
				map: 'function(doc) { if (doc.type == \'' + params.type + '\') {' + _this.buildEmitKey(params.keys) + '} }'
			};
			
			_this.connection.saveDoc(documentName, doc, callback);
		});
	},
	
	buildEmitKey: function(keys) {
		var emitKey = 'emit(';
		
		if (typeof keys == 'string') {
			keys = [keys];
		}
		
		if (keys.length == 1) {
			return emitKey + 'doc.' + keys[0] + ', doc);';
		}
		
		emitKey += '[';
		for (var i = 0, key; (key = keys[i]) != null; i++) {
			if (i != 0) {
				emitKey += ', ';
			}
			emitKey += 'doc.' + key;
		}
		emitKey += '], doc);';
		
		return emitKey;
	},
	
	deleteDatabase: function(callback) {
		this.connection.request('DELETE', '/', callback);
	},
	
	createDatabase: function(callback) {
		this.connection.request('PUT', '/', callback);
	}
});