describe 'Endtable.Object'
	before
		endtableCore = new endtable.Core({
			database: 'test'
		});
	end
		
	describe 'load'
		it 'should populate an objects instance variables with fields from key/value store'
			
			assertCallback = function(obj) {
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
	
	it 'shoud set the dirty flag on the object when an instance variable is uploaded'
		assertCallback = function(obj) {
			obj.dirty.should.equal(false);
			obj.name = 'Ben Coe'
			obj.dirty.should.equal(true);
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