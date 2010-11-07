var Endtable = require('endtable').Endtable;
endtable = new Endtable();

endtable.connector.createView({
	keys: ['age'],
	type: 'person'
}, function() {
	endtable.connector.createView({
		keys: ['name'],
		type: 'person'
	});	
});
