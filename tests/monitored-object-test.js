var equal = require('assert').equal,
	puts = require('sys').puts,
	endtable = require('../lib');

exports.tests = {
	'should find validators attached to object': function(finished, prefix) {
		var Person = endtable.Object.extend(
			{
				validatesName: function() {
					return true;
				},
			
				validatesAge: [
					function() {
						return true;
					}, 
					function() {
						return true;
					}
				]
			},
			{
				engine: new endtable.Engine(),
				type: 'person'
			}
		);
		person = new Person();
		equal(person.validators.age[1](), true, prefix);
		equal(person.validators.name[0](), true, prefix);
		finished();
	},
	
	'should raise an error if a validator fails when an instance variable is set': function(finished, prefix) {
		var Person = endtable.Object.extend(
			{
				validatesName: function() {
					return true;
				},
			
				validatesAge: [
					function(age) {
						return typeof age == 'number';
					}
				]
			},
			{
				engine: new endtable.Engine(),
				type: 'person'
			}
		);
	
		var errorRaised = false;
	
		person = new Person({
			age: 25,
			errorCallback: function(error) {
				equal(error.error, 'validation', prefix);
				finished();
			}
		});
				
		person.age = 'Ben';
	}
};