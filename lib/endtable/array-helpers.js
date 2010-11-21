/**
 * Various array helpers used throughout endtable.
 */

function extend( o1, o2, o3 ) {
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

function isArray(obj) {
	try {
		if (typeof obj == 'object' && obj.constructor.toString().indexOf("Array") !== -1) {
		   return true;
		}
	} catch (e) {
		
	}
	return false;
}

function hashArray(array) {
	var hash = '';
	for (var i = 0; i < array.length; i++) {
		var value = array[i];
		
		if (isArray(value)) {
			hash += hashArray(value);
		} else if (typeof array[i] == 'object') {
			hash += value.localUID;
		} else {
			hash += value;
		}
	}
	return hash;
}

exports.extend = extend;
exports.isArray = isArray;
exports.hashArray = hashArray;