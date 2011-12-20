/**
 * Used by the db-interface to actually communicate with CouchDB.
 */
var sys = require('sys'),
	connect = require('connect'),
	couchdb = require('./dep/couchdb'),
	simpleInheritance = require('./dep/simple-inheritance'),
	arrayHelpers = require('./array-helpers'),
	synchronousProcessor = new (require('./synchronous-processor').SynchronousProcessor)(),
	ErrorHandler = require('./error-handler').ErrorHandler;

exports.connector = Class.extend({
	
	defaults: {
		legacy: false,
		errorHandler: false
	},

	init: function(params) {
		arrayHelpers.extend(this, this.defaults, params);
		this.synchronousProcessor = synchronousProcessor;
		this.errorHandler = this.errorHandler || new ErrorHandler();
	},
	
	connect: function() {
		this.connection = couchdb
		    .createClient(this.port, this.host, this.user, this.password, this.errorHandler)
		    .db(this.database);
	},
	
	deleteDocument: function(params, callback) {
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'deleteDocument',
			params
		);
		
		this.connection.removeDoc(params._id, params._rev, callback);
	},
	
	saveDocument: function(params, callback) {
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'saveDocument',
			params
		);
		
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
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'loadDocument',
			params,
			'warn'
		);
		
		if (typeof params == 'object') {
			this.loadDocumentByParams(params, callback);
		} else {
			this.connection.request('/' + params, callback);
		}
	},
	
	loadDocumentByParams: function(params, callback) {
		
		this.fixCommonTypos(params);
		
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'loadDocumentByParams',
			params,
			'warn'
		);
		
		var defaults = {
			key: false,
			startkey: false,
			startkey_docid: false,
			endkey: false,
			endkey_docid: false,
			descending: false,
			limit: false,
			count: false,
			skip: 0,
			type: '',
			keys: []
		}
		
		params = arrayHelpers.extend(defaults, {}, params);
		
		// if there's a custom view specified, load by that instead
		var viewURL;
		if( params.customView ) {
			viewURL = this.buildCustomViewURL(params.customView, params.type);
		} else {
			viewURL = this.buildViewURL(params.keys, params.type);
		}
		
		var viewParams = this.buildViewParams({
			key: params.key,
			startkey: params.startkey,
			startkey_docid: params.startkey_docid,
			endkey: params.endkey,
			endkey_docid: params.endkey_docid,
			descending: params.descending,
			limit: params.limit,
			count: params.count,
			skip: params.skip
		});
		this.connection.request(viewURL + viewParams, callback);
	},
	
	fixCommonTypos: function(params) {
		params.keys = params.keys || [];
		
		if (params.key && !params.keys) {
			params.keys = params.key;
		}
		
		if (typeof params.keys == 'string') {
			params.keys = [params.keys];
		}
	},
	
	buildViewURL: function(keys, type) {
		if (this.legacy) {
			return '/_view/' + type + '/' + this.buildViewName(keys);
		} else {
			return '/_design/' + type + '/_view/' + this.buildViewName(keys);
		}
	},
	
	buildCustomViewURL: function(name, type) {
		if (this.legacy) {
			return '/_view/' + type + '/' + this.buildCustomViewName(name);
		} else {
			return '/_design/' + type + '/_view/' + this.buildCustomViewName(name);
		}
	},
	
	buildDocumentName: function(type) {
		return '_design/' + type;
	},

	buildCustomViewName: function(name) {
		return 'custom_'+name;
	},

	buildViewName: function(keys) {
		var viewName = 'by';
				
		for (var i = 0, key; (key = keys[i]) != null; i++) {
			viewName += '_' + key;
		}
		
		return viewName;
	},
	
	buildViewParams: function(getParams) {
		var i = 0,
			getParamsString = '';
		
		for (var key in getParams) {
			if (getParams.hasOwnProperty(key) && getParams[key]) {
				// we omit the custom view keys, if specified
				if(key=='customView') {
					continue;
				}
				
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
		
		this.fixCommonTypos(params);
		
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'createView',
			params
		);
		
		var _this = this;
		
		var documentName = this.buildDocumentName(params.type);
		this.synchronousProcessor.runSynchronous(_this, function(documentName, callback) {
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

		}, [documentName, callback]);
	},

	createCustomView: function(params,callback) {
		var _this = this;

		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'createCustomView',
			params
		);
	
		if(!params.customView || typeof(params.customView) != 'function' || !params.customView.name) {
			callback({message:'params.customView must be a named function'},null);
		}

    	var documentName = this.buildDocumentName(params.type);
		
		this.synchronousProcessor.runSynchronous(_this, function(documentName, callback) {
			_this.connection.getDoc(documentName, function(error, doc) {
				
				if (!doc) {
					doc = {views: {}};
				}
			
				// create custom view
				doc.views[_this.buildCustomViewName(params.customView.name)] = {
					map: params.customView.toString().replace(/function.*?\(/,'function(')
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
		}, [documentName, callback]);
	},
	
	buildEmitKey: function(keys) {
		var emitKey = 'emit(';
		
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
		
		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'deleteDatabase',
			{}
		);
		
		this.connection.request('DELETE', '/', callback);
	},
	
	createDatabase: function(callback) {

		callback = this.errorHandler.wrapCallback(
			callback,
			'CouchConnector',
			'createDatabase',
			{}
		);		

		this.connection.request('PUT', '/', callback);
	}
});
