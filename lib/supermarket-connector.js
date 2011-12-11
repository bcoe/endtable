/* used couchdb-connector.js as example */
var Store = require('supermarket'),
	arrayHelpers = require('./array-helpers');

exports.connector = Class.extend({
    defaults: {
        legacy: false
    },

    init: function(params) {
        arrayHelpers.extend(this, this.defaults, params);
    },
    
    connect: function() {
        this.store = new Store({ filename: this.database, json : true }, function (err) {
            if (err) throw new Error(err);
        });
    },
    
    deleteDocument: function(params, callback) {
        this.store.remove(params._id, function (err) {
            if (err) throw new Error(err);
            callback();
        });
    },
    
    saveDocument: function(params, callback) {
        if (Object.keys(params.fields).length == 0) return; // don't save empty docs
        if (Object.keys(params.fields).length == 1 && params.fields.type) return; // don't save empty docs

        var defaults = {
            type: '',
            fields: {}
        };
        
        params = arrayHelpers.extend(defaults, {}, params);
        
        params.fields.type = params.type;
        
        if (params.fields && params.fields._id) {
            var key = params.fields._id;
        } else {
            var key = randKey();
        }
        params.fields._id = key;
        this.store.set(key, params.fields, function (err, key, val) {
            if (err) throw new Error(err);
            val.id = key;
            val.rev = 'moo';
            callback(null, val);
        });
    },
    
    loadDocument: function(filter, callback) {
        this.store.filter(function (record) {
            return filter(record.value);
        }).join(function (records) {
            var moo = { rows : records };
            callback(null, moo);
        });
    },
    
    deleteDatabase: function(callback) {
        var store = this.store;
        store.forEach(function (x) {
            store.remove(x.key);
        });
        callback();
    },
    
    createDatabase: function(callback) {
        // created by connect
        callback();
    }
});

function range(i,j) { // [i,j]
    var a = [];
    for (;i<=j;i++) a.push(i);
    return a;
}

function randKey() {
    var chars = range(0x30, 0x39)  // 0-9
        .concat(range(0x41, 0x5a)) // A-Z
        .concat(range(0x61, 0x7a)) // a-z
        .map(function (x) { return String.fromCharCode(x) });
    var key = '';
    range(1,32).forEach(function (x) {
        key += chars[Math.floor(Math.random()*chars.length)]
    }); // key collision 1 in 10^57.
    return key;
}

