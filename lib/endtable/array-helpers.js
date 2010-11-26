/**
 * Various array helpers used throughout endtable.
 */
var sys = require('sys');

exports.extend = function( o1, o2, o3 ) {
	extendPair(o1, o2);
	extendPair(o1, o3);
	return o1;
}

function extendPair( o1, o2 ) {
	for (var key in o2) {
		if ( o2.hasOwnProperty(key) ) {
			o1[key] = o2[key];
		}
	}
}

exports.isArray = function(obj) {
	try {
		if (typeof obj == 'object' && obj.constructor.toString().indexOf("Array") !== -1) {
		   return true;
		}
	} catch (e) {
		
	}

	return false;
}

exports.hashArray = function(array) {
	var hash = '';
	for (var i = 0; i < array.length; i++) {
		var value = array[i];
		
		if (exports.isArray(value)) {
			hash += exports.hashArray(value);
		} else if (typeof array[i] == 'object') {
			hash += value.localUID;
		} else {
			hash += value;
		}
	}
	return hash;
}