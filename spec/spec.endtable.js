describe 'endtable'

	describe 'init'	
		it 'should extend base object with defaults'
			endtable = new Endtable()
			endtable.host.should.equal('localhost')
			endtable.database.should.equal('development')
		end
		
		it 'should overwrite defaults with params'
			endtable = new Endtable({
				host: '127.0.0.1',
				database: 'production'
			})
			endtable.host.should.equal('127.0.0.1')
			endtable.database.should.equal('production')
		end
	end
	
	describe 'loadDocument with mocked connector'
		
		it 'should create a view if one does not exist'
			createViewCalled = false
			endtable = new Endtable()
			endtable.connector = {
				loadDocument: function(params, callback) {
					callback({
						error: 'not_found'
					})
				},
				createView: function(params, callback) {
					createViewCalled = true
				}
			}
		
			endtable.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true
			})
			
			createViewCalled.should.be_true()	
		end
		
		it 'should append a second view to an existing design document'
			endtable = new Endtable({
				port: 5984,
				host: 'localhost',
				user: '',
				password: '',
				database: 'test'
			});
		end
	end
end