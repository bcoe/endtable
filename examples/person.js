var sys = require('sys');

var EndtableCore = require('endtable').EndtableCore;
endtableCore = new EndtableCore({
	database: 'people_example'
});

function populateData() {
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Sally Brown',
			age: 24
		}
	});
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Benjamin Coe',
			age: 27
		}
	});
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Benjamin Coe',
			age: 30
		}
	});
	
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Benjamin Coe',
			age: 31
		}
	});
	
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Eric Brown',
			age: 28
		}
	});
	
	endtableCore.saveDocument({
		type: 'person',
		fields: {
			name: 'Sally Johnson',
			age: 26
		}
	});
}

function createViews() {
	endtableCore.loadDocument({
		keys: ['age'],
		type: 'person'
	}, function() {
		endtableCore.loadDocument({
			keys: ['name', 'age'],
			type: 'person'
		});	
	});
}

(function resetDatabase(callback) {
	endtableCore.connector.deleteDatabase(function() {
		endtableCore.connector.createDatabase(function() {
			callback();
		});
	});
})(function() {
	createViews();
	populateData();
});