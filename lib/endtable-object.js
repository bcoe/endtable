/**
 * The Mapper-Backed Object at the heart of Endtable.
 */
var sys = require('sys'),
	simpleInheritance = require('./dep/simple-inheritance'),
	MonitoredObject = require('./monitored-object').MonitoredObject,
	arrayHelpers = require('./array-helpers'),
	SynchronousProcessor = require('./synchronous-processor').SynchronousProcessor,
	ErrorHandler = require('./error-handler').ErrorHandler;

exports.Object = MonitoredObject.extend({
	
	init: function(params, firstSaveCallback) {
		this._super(params);
		this.params = params;
		
		if (this.errorCallback) {
			this.errorHandler = this.engine.createErrorHandler(this.errorCallback);
		} else {
			this.errorHandler = this.engine.errorHandler;
		}
		
		this.firstSaveCallback = firstSaveCallback;
		this.synchronousProcessor = new SynchronousProcessor();
		this.Constructor = params.Constructor || exports.Object;
		this.createCustomViews();
	},
	
	createCustomViews: function() {
		if(this.customViews) {
			for(var i=0, customView; (customView = this.customViews[i]) != null; i++) {
				this.engine.connector.createCustomView(
					{
						'type': this.params.type,
						'customView': customView
					},
					null
				);
			}
		}
	},
	
	load: function(params, callback) {
		
		callback = this.errorHandler.wrapCallback(
			callback,
			'EndtableObject',
			'load',
			params
		);
		
		params.type = params.type || this.type;
		
		var _this = this;
		this.loadCallback = callback;
		this.engine.loadDocument(params, function(error, doc) {
			_this.loadDocumentCallback(error, doc);
		});
	},
	
	delete: function(callback) {
	
		callback = this.errorHandler.wrapCallback(
			callback,
			'EndtableObject',
			'delete',
			{}
		);
		
		this.engine.connector.deleteDocument(this.instanceVariables, callback);
	},
	
	loadDocumentCallback: function(error, doc) {
		if (!error) {
			this.loadFromDocument(doc);
		} else {
			this.loadCallback(error, null);
		}
	},
	
	loadFromDocument: function(doc) {
		var loadReturn = loadReturn = [];
		
		for (var i = 0, row; (row = doc.rows[i]) != null; i++) {
			var object = new this.Constructor(this.params);
			object.dontPersist = false;
			object.loadFromRow(row);
			loadReturn.push(object);
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
	
	save: function(callback) {
		// Fire the callback provided in the constructor
		// when the object first loads.
		if (!callback && this.firstSaveCallback) {
			callback = this.firstSaveCallback;
			this.firstSaveCallback = null;
		}
		
		if (this.dontPersist) {
			return;
		}
		
		var _this = this;
		
		this.synchronousProcessor.runSynchronous(_this, function() {
			
			var params = this.serialize();
			
			callback = this.errorHandler.wrapCallback(
				callback,
				'EndtableObject',
				'save',
				params
			);
			
			_this.engine.saveDocument(
				{
					type: this._type,
					fields: params
				},
				function(error, doc) {
					if (!error) {
						_this.instanceVariables._rev = doc.rev;
						_this.instanceVariables._id = doc.id;
					}
					callback(error, doc);
					_this.synchronousProcessor.next();
				}
			);
			
		}, []);
	}
});
