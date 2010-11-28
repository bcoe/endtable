describe 'CouchConnector'

	describe 'loadDocument with mocked connection'
	
		before
			lastURL = ''
			
			c = new connector.connector({
				database: 'test',
				legacy: LEGACY_VIEW
			})
			
			c.connection = {
				request: function(url) {
					lastURL = url;
				}
			}
		end
		
		it 'should generate a restful URL based on a document id'
			c.loadDocument('foobar')
			lastURL.should.equal('/foobar')
		end
	
		it 'should generate a restful URL based on DB and Keys'
			c.loadDocument({
				keys: ['name', 'age'],
				type: 'person'
			})
			
			if (LEGACY_VIEW) {
				lastURL.should.equal('/_view/person/by_name_age')
			} else {
				lastURL.should.equal('/_design/person/_view/by_name_age')
			}
		end

		it 'should build a URL with the get parameter descending'
			c.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true
			})

			if (LEGACY_VIEW) {
				lastURL.should.equal('/_view/person/by_name_age?descending=true')
			} else {
				lastURL.should.equal('/_design/person/_view/by_name_age?descending=true')
			}
		end
		
		it 'should build a URL with the get parameters descending and startkey'
			c.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true,
				startkey: ['john', '13'],
				endkey: 'foo'
			})
			
			lastURL.should.match('startkey=%5B%22john%22%2C%2213%22%5D')
			lastURL.should.contain('descending=true')
		end

		it 'should build a URL with the get paremeters limit and skip'
			c.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				limit: 1,
				skip: 1
			})
	    
			lastURL.should.contain('limit=1')
			lastURL.should.contain('skip=1')
		end
	end
	
	describe 'loadDocument with working connection'
		it 'should create an exception if the requested view does not exist'

			var c = new connector.connector({
				database: 'test',
				legacy: LEGACY_VIEW
			})

			c.connect()

			c.loadDocument({keys: ['name', 'age'], type: 'not_a_person'}, function(error, doc) {
				(error ? true : false).should.be_true();
			});
			
			this.should.assert_later()
		end
	end
	
	describe 'createView with mocked connection'
		before
			lastDocument = {}
			
			c = new connector.connector({
				database: 'development',
				legacy: LEGACY_VIEW
			})
			
			c.connection = {
				
				saveDoc: function(documentName, document) {
					lastDocument = document
				},
				
				getDoc: function(documentName, callback) {
					callback(null, null);
				},
				
			}
			
			c.synchronousProcessor = {
				runSynchronous: function(context, callback, arguments) {
					callback.apply(context, arguments);
				}
			}
		end
		
		it 'should create a map function with an if statement filtering by type'
			c.createView({
				keys: ['name'],
				type: 'person'
			})
			lastDocument.views.by_name.map.should.contain('if (doc.type == \'person\') {')
		end
		
		it 'should create a map function with a single value being emitted when a single value is passed in'
			c.createView({
				keys: ['name'],
				type: 'person'
			})
			lastDocument.views.by_name.map.should.contain('emit(doc.name, doc);')

			c.createView({
				keys: 'name',
				type: 'person'
			})
			lastDocument.views.by_name.map.should.contain('emit(doc.name, doc);')
		end
		
		it 'should create a map function with an array when multiple keys are provided'
			c.createView({
				keys: ['name', 'age'],
				type: 'person'
			})
			lastDocument.views.by_name_age.map.should.contain('emit([doc.name, doc.age], doc);')
		end
	end
	
	describe 'createView'
		it 'when two createView calls are executed in a row it should add both views to a design'
			endtableEngine = new endtable.Engine({
				database: 'test'
			});
		
			c = endtableEngine.connector
			
			c.createView({
				keys: ['name', 'type', 'age'],
				type: 'two_view_test'
			})
			
			c.createView({
				keys: ['type', 'name', 'age'],
				type: 'two_view_test'
			})
			
			
			// Examine the design created.
			setTimeout(function() {
				endtableEngine.loadDocument('_design/two_view_test', function(error, doc) {
					(typeof doc.views.by_name_type_age).should.equal('object');
					(typeof doc.views.by_type_name_age).should.equal('object');
				});
			}, TIMEOUT_INTERVAL);
	
			this.should.assert_later()
		end
	end
end
