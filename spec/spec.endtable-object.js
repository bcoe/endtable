describe 'Endtable.Object'
	before
		endtableCore = new endtable.Core({
			database: 'test'
		});
		endtableObject = new endtable.Object();
	end
		
	describe 'load'
		it 'should populate an objects instance variables with fields from key/value store'
			endtableCore.loadDocument({
				keys: 'name',
				type: 'person',
				key: 'Mark Twain'
			}, function(error, doc) {
				doc.rows[0].value.name.should.equal('Mark Twain')
				doc.rows[0].value.age.should.equal(150)
			});
			
			this.should.assert_later()
		end
	end
end