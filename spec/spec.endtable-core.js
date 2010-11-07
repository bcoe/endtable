describe 'EndtableCore'

	describe 'init'	
		it 'should extend base object with defaults'
			endtableCore = new EndtableCore()
			endtableCore.host.should.equal('localhost')
			endtableCore.database.should.equal('development')
		end
		
		it 'should overwrite defaults with params'
			endtableCore = new EndtableCore({
				host: '127.0.0.1',
				database: 'production'
			})
			endtableCore.host.should.equal('127.0.0.1')
			endtableCore.database.should.equal('production')
		end
	end
	
	describe 'loadDocument'
		
		it 'should create a view if one does not exist'
			createViewCalled = false
			endtableCore = new EndtableCore()
			endtableCore.connector = {
				loadDocument: function(params, callback) {
					callback({
						error: 'not_found'
					})
				},
				createView: function(params, callback) {
					createViewCalled = true
				}
			}
		
			endtableCore.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true
			})
			
			createViewCalled.should.be_true();
		end
	
		it 'should update an existing design with a new view'
			endtableCore = new EndtableCore({
				database: 'test'
			});
			
			// Create the first view of the data.
			endtableCore.loadDocument({
				keys: ['age', 'name'],
				type: 'person'
			}, function() {
				
				// Create the second view of the data.
				endtableCore.loadDocument({
					keys: 'age',
					type: 'person'
				}, function() {
					
					// Examine the design created.
					endtableCore.loadDocument('_design/person', function(error, doc) {
						
						(typeof doc.views.by_age_name).should.equal('object');
						(typeof doc.views.by_age).should.equal('object');
						
					});
					
				})
			});
			
			this.should.assert_later()
		end
		
	end
	
	describe 'saveDocument'
		it 'should save a document to couch with the appropriate fields.'
			endtableCore = new EndtableCore({
				database: 'test'
			});
			
			endtableCore.saveDocument({
				type: 'person',
				fields: {
					'name': 'Benjamin Coe',
					'age': 27
				}
			}, function(error, doc) {
				endtableCore.loadDocument(doc.id, function(error, doc) {
					doc.name.should.equal('Benjamin Coe');
					doc.age.should.equal(27);
				});
			});
			
			this.should.assert_later()
		end
	end
end