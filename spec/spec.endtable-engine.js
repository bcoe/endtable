describe 'Endtable.Engine'

	describe 'init'	
		it 'should extend base object with defaults'
			endtableEngine = new endtable.Engine()
			endtableEngine.host.should.equal(EXPECTED_HOST)
			endtableEngine.database.should.equal('development')
		end
		
		it 'should overwrite defaults with params'
			endtableEngine = new endtable.Engine({
				host: '127.0.0.1',
				database: 'production'
			})
			endtableEngine.host.should.equal('127.0.0.1')
			endtableEngine.database.should.equal('production')
		end
	end
	
	describe 'loadDocument'
		
		it 'should create a view if one does not exist'
			createViewCalled = false
			endtableEngine = new endtable.Engine()
			endtableEngine.connector = {
				loadDocument: function(params, callback) {
					callback({
						error: 'not_found'
					})
				},
				createView: function(params, callback) {
					createViewCalled = true
				}
			}
		
			endtableEngine.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true
			})
			
			createViewCalled.should.be_true();
		end
	
		it 'should update an existing design with a new view'

			endtableEngine = new endtable.Engine({
				database: 'test'
			});
			
			// Create the first view of the data.
			endtableEngine.loadDocument({
				keys: ['age', 'name'],
				type: 'update_view_test'
			}, function(error, doc) {

				// Create the second view of the data.
				endtableEngine.loadDocument({
					keys: 'age',
					type: 'update_view_test'
				}, function() {
					
					// Examine the design created.
					endtableEngine.loadDocument('_design/update_view_test', function(error, doc) {
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
			endtableEngine = new endtable.Engine({
				database: 'test'
			});
			
			endtableEngine.saveDocument({
				type: 'person',
				fields: {
					'name': 'Benjamin Coe',
					'age': 27
				}
			}, function(error, doc) {
				endtableEngine.loadDocument(doc.id, function(error, doc) {
					doc.name.should.equal('Benjamin Coe');
					doc.age.should.equal(27);
				});
			});
			
			this.should.assert_later()
		end
	end
end