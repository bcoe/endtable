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
var SynchronousProcessor = require('./synchronous-processor').SynchronousProcessor;

exports.connector = Class.extend({

	init: function(params) {
		arrayHelpers.extend(this, {}, params);
		this.synchronousProcessor = new SynchronousProcessor();
	},
	
	connect: function() {
		this.connection = couchdb
		    .createClient(this.port, this.host, this.user, this.password)
		    .db(this.database);
	},
	
	saveDocument: function(params, callback) {
		var defaults = {
			type: '',
			fields: {}
		};
		
		params = arrayHelpers.extend(defaults, {}, params);
		
		params.fields.type = params.type;
		
		if (params.fields && params.fields._id) {
			this.connection.saveDoc(params.fields._id, params.fields, callback);
		} else {
			this.connection.saveDoc(params.fields, callback);
		}
	},
	
	loadDocument: function(params, callback) {
		if (typeof params == 'object') {
			this.loadDocumentByParams(params, callback);
		} else {
			this.connection.request('/' + params, callback);
		}
	},
	
	loadDocumentByParams: function(params, callback) {
		var defaults = {
			key: false,
			startkey: false,
			endkey: false,
			descending: false,
			count: false,
			type: '',
			keys: []
		}
		params = arrayHelpers.extend(defaults, {}, params);
				
		var viewURL = this.buildViewURL(params.keys, params.type);
		
		var viewParams = this.buildViewParams({
			key: params.key,
			startkey: params.startkey,
			endkey: params.endkey,
			descending: params.descending,
			count: params.count
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
		callback = callback || function() {};
		var _this = this;
		var doc = {views: {}};
		
		var documentName = this.buildDocumentName(params.type);
		_this.synchronousProcessor.runSynchronous(_this, function(documentName, doc, callback) {
			_this.connection.getDoc(documentName, function(error, doc) {
				
				if (!doc) {
					doc = {views: {}};
				}
				
				doc.views[_this.buildViewName(params.keys)] = {
					map: 'function(doc) { if (doc.type == \'' + params.type + '\') {' + _this.buildEmitKey(params.keys) + '} }'
				};
		
				_this.connection.saveDoc(
					documentName,
					doc,
					function(error, doc) {
						callback(error, doc);
						_this.synchronousProcessor.next();	
					}
				);
			});

		}, [documentName, doc, callback]);			
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