describe 'Endtable.Object'
	describe 'constructor'
		it 'should save a new object created'
			endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			setTimeout(function() {
				var person = {};
				endtableObject = new endtable.Object({
					engine: endtableEngine
				}).load({
					keys: 'name',
					type: 'person',
					key: 'John Doe'
				}, function(error, obj) {
					person = obj[0];
				});
				
				setTimeout(function() {
					person.name.should.equal('John Doe')
					person.age.should.equal(75)
				}, TIMEOUT_INTERVAL);
			}, TIMEOUT_INTERVAL);
			
			endtableObject = new endtable.Object({
				engine: endtableEngine,
				type: 'person',
				name: 'John Doe',
				age: 75
			});
			
			this.should.assert_later()
		end
		
		it 'should re-save new objects when instance variables are added'
			endtableObject = new endtable.Object({
				engine: endtableEngine,
				type: 'person',
				name: 'Bob Yewchuck',
				age: 99
			});
			endtableObject.brain = 'big'
			
			setTimeout(function() {
				endtableObject = new endtable.Object({
					engine: endtableEngine
				}).load({
					keys: 'name',
					type: 'person',
					key: 'Bob Yewchuck'
				}, function(error, obj) {
					obj[0].brain.should.equal('big')
				});
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
	end
	
	describe 'save'
		it 'should save an object when a new element is added to a dependent array'
			endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			var person = new endtable.Object({
				engine: endtableEngine,
				saveRate: 500000,
				dependentArray: [],
				type: 'person',
				name: 'Ben',
				age: 27
			});
			person._dirty = false;
			person.dependentArray.push('hello');
			
			setTimeout(function() {
				person._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
		
		it 'should save an object when a new element is added to a dependent object'
			endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			var person = new endtable.Object({
				engine: endtableEngine,//fixing.
				saveRate: 500000,
				dependentObject: {subobject: {a: 'hello'}},
				type: 'person',
				name: 'Ben',
				age: 27
			});
			person._dirty = false;
			person.dependentObject.subobject.foobar = 'word';
			
			setTimeout(function() {
				person._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
		
		it 'should save an object when a parameter on an object in a dependant array is modified'
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			var person = new endtable.Object({
				engine: endtableEngine,//fixing.
				saveRate: 500000,
				dependentArray: [{should_save_an_object: 'hello'}],
				type: 'person',
				name: 'Ben',
				age: 27
			});
			person._dirty = false;
			person.dependentArray[0].a = 'goodbye';
			
			setTimeout(function() {
				person._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
		
		it 'should save an object when an item is added to an array in an array'
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			var person = new endtable.Object({
				engine: endtableEngine,//fixing.
				saveRate: 500000,
				dependentArray: ['apple', ['banana', 'orange']],
				type: 'person',
				name: 'Ben',
				age: 27
			});
			person._dirty = false;
			person.dependentArray[1].push('snuh');
			
			setTimeout(function() {
				person._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
		
		it "should save an object when an item is changed in an object in an array that's in an array"
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			var person = new endtable.Object({
				engine: endtableEngine,//fixing.
				saveRate: 500000,
				dependentArray: ['apple', ['banana', {'pineapple' : 'apple'}]],
				type: 'person',
				name: 'Ben',
				age: 27
			});
			person._dirty = false;
			person.dependentArray[1][1].pineapple = 'tasty';
			
			setTimeout(function() {
				person._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later()
		end
	end

	describe 'load'
		it 'should populate an objects instance variables with fields from key/value store'
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			assertCallback = function(error, obj) {
				obj[0].name.should.equal('Mark Twain')
				obj[0].age.should.equal(150)
			}
			
			endtableObject = new endtable.Object({
				engine: endtableEngine
			}).load({
				keys: 'name',
				type: 'person',
				key: 'Mark Twain'
			}, assertCallback);
			
			this.should.assert_later()
		end
		
		it 'should return an array of objects if a query would return multiple results'
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
		
			assertCallback = function(error, obj) {
				(obj.length > 0).should.be_true()
				obj[0].type.should.equal('person')
			}
			
			endtableObject = new endtable.Object({
				engine: endtableEngine
			}).load({
				keys: 'age',
				type: 'person',
				startkey: 20,
				endkey: 40
			}, assertCallback);
			
			this.should.assert_later()
		end
		
		it 'should return an instance of an extending endtable class if an endtable object is sub-classed'
			var extended = false;
		
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});	
			
			var Person = endtable.Object.extend(
				{
					testExtended: function() { extended = true }
				},
				{
					engine: endtableEngine,
					type: 'person'
				}
			);
			
			endtableObject = new Person({
				engine: endtableEngine
			}).load({
				keys: 'age',
				startkey: 20,
				endkey: 40
			}, function(error, people) {
				people[0].testExtended()
			});
			
			setTimeout(function() {
				extended.should.equal(true);
			}, TIMEOUT_INTERVAL);
			
			this.should.assert_later();
		end
	end
	
	describe 'delete'
		it 'should let you delete a single document'
			assertCallback = function(error, obj) {
				obj.length.should.equal(0)
			}
		
			var endtableEngine = new endtable.Engine({
				database: 'test'
			});
			
			new endtable.Object({
				engine: endtableEngine
			}).load({
				keys: 'name',
				type: 'person',
				key: 'Delete Test'
			}, function(error, obj) {
				obj[0].name.should.equal('Delete Test');

				if (obj[0].delete) {
					
					obj[0].delete(function() {
					
						new endtable.Object({
							engine: endtableEngine
						}).load({
							keys: 'name',
							type: 'person',
							key: 'Delete Test'
						}, assertCallback);
					
					});
					
				}
			});
			
			this.should.assert_later()
		end
	end
	
	it 'should set a dirty flag on the object when an instance variable is added'
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		assertCallback = function(error, obj) {
			obj[0]._dirty.should.equal(false);
			obj[0].newKey = ['apple', 'banana'];
			
			setTimeout(function() {
				obj[0]._dirty.should.equal(true);
			}, TIMEOUT_INTERVAL);
		}
		
		endtableObject = new endtable.Object({
			engine: endtableEngine,
			saveRate: 500000
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Zeebert'
		}, assertCallback);
		
		this.should.assert_later()
	end
	
	it 'should set the dirty flag on the object when an instance variable is updated'
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		assertCallback = function(error, obj) {
			obj[0]._dirty.should.equal(false);
			obj[0].age = 55
			obj[0]._dirty.should.equal(true);
		}
		
		endtableObject = new endtable.Object({
			engine: endtableEngine
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Change Test'
		}, assertCallback);
		
		this.should.assert_later()
	end
	
	it 'should automatically persist an object to couch if it has been dirtied'
		var dirtyCallback = function(error, obj) {
			obj[0].name = 'Brian Wilson';
		}
		
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		var saveCalled = false;
		endtableEngine.connector.saveDocument = function(params, callback) {
			saveCalled = true;
		}
		
		endtableObject = new endtable.Object({
			engine: endtableEngine
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Christian'
		}, dirtyCallback);
		
		setTimeout(function() {
			saveCalled.should.equal(true);
		}, TIMEOUT_INTERVAL);
		
		this.should.assert_later()
	end
	
	it 'should actually save the values back to couch when an object is dirtied'
		var dirtyCallback = function(error, obj) {
			obj[0].name = 'Brian Wilson';
		}
		
		var endtableEngine = new endtable.Engine({
			database: 'test'
		});
		
		endtableObject = new endtable.Object({
			engine: endtableEngine
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Change Test2'
		}, dirtyCallback);
		
		setTimeout(function() {
			var loadCallback = function(error, obj) {
				obj[0].name.should.equal('Brian Wilson');
			}
			
			endtableObject = new endtable.Object({
				engine: endtableEngine
			}).load({
				keys: 'name',
				type: 'person',
				key: 'Brian Wilson'
			}, loadCallback);
		}, TIMEOUT_INTERVAL);
		
		this.should.assert_later()
	end	
end