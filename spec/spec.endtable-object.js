describe 'Endtable.Object'
	describe 'constructor'
		it 'should save a new object created'
		
		end
		
		it 'should re-save new objects when instance variables are added'
			
		end
	end

	describe 'load'
		it 'should populate an objects instance variables with fields from key/value store'
			endtableCore = new endtable.Core({
				database: 'test'
			});	
		
			assertCallback = function(error, obj) {
				obj.name.should.equal('Mark Twain')
				obj.age.should.equal(150)
			}
			
			endtableObject = new endtable.Object({
				engine: endtableCore
			}).load({
				keys: 'name',
				type: 'person',
				key: 'Mark Twain'
			}, assertCallback);
			
			this.should.assert_later()
		end
	end
	
	it 'should set a dirty flag on the object when an instance variable is added'
		endtableCore = new endtable.Core({
			database: 'test'
		});
		
		assertCallback = function(error, obj) {
			obj._dirty.should.equal(false);
			obj.newKey = ['apple', 'banana'];
			
			setTimeout(function() {
				obj._dirty.should.equal(true);
			}, 350);
		}
		
		endtableObject = new endtable.Object({
			engine: endtableCore
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Zeebert'
		}, assertCallback);
		
		this.should.assert_later()
	end
	
	it 'should set the dirty flag on the object when an instance variable is updated'
		endtableCore = new endtable.Core({
			database: 'test'
		});
		
		assertCallback = function(error, obj) {
			obj._dirty.should.equal(false);
			obj.name = 'Ben Coe'
			obj._dirty.should.equal(true);
		}
		
		endtableObject = new endtable.Object({
			engine: endtableCore
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Mark Twain'
		}, assertCallback);
		
		this.should.assert_later()
	end
	
	it 'should automatically persist an object to couch if it has been dirtied'
		var dirtyCallback = function(error, obj) {
			obj.name = 'Brian Wilson';
		}
		
		endtableCore = new endtable.Core({
			database: 'test'
		});
		
		var saveCalled = false;
		endtableCore.connector.saveDocument = function(params, callback) {
			saveCalled = true;
		}
		
		endtableObject = new endtable.Object({
			engine: endtableCore
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Christian'
		}, dirtyCallback);
		
		setTimeout(function() {
			saveCalled.should.equal(true);
		}, 350);
		
		this.should.assert_later()
	end
	
	it 'should actually save the values back to couch when an object is dirtied'
		var dirtyCallback = function(error, obj) {
			obj.name = 'Brian Wilson';
		}
		
		endtableCore = new endtable.Core({
			database: 'test'
		});
		
		endtableObject = new endtable.Object({
			engine: endtableCore
		}).load({
			keys: 'name',
			type: 'person',
			key: 'Christian'
		}, dirtyCallback);
		
		setTimeout(function() {
			var loadCallback = function(error, obj) {
				obj.name.should.equal('Brian Wilson');
			}
			
			endtableObject = new endtable.Object({
				engine: endtableCore
			}).load({
				keys: 'name',
				type: 'person',
				key: 'Brian Wilson'
			}, loadCallback);
		}, 350);
		
		this.should.assert_later()
	end	
end