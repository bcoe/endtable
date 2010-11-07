/**
 * Various helper functions used across the classes in
 * endtable.
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

exports.extend = extend;