describe 'CouchConnector'

	describe 'loadDocument with mocked connection'
	
		before
			lastURL = ''
			
			c = new connector.connector({
				port: 5984,
				host: 'localhost',
				user: '',
				password: '',
				database: 'test'
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
			
			lastURL.should.equal('/_view/person/by_name_age')
		end

		it 'should build a url with the get parameter descending'
			c.loadDocument({
				keys: ['name', 'age'],
				type: 'person',
				descending: true
			})

			lastURL.should.equal('/_view/person/by_name_age?descending=true')
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
	end
	
	describe 'loadDocument with working connection'
		it 'should create an exception if the requested view does not exist'

			var c = new connector.connector({
				port: 5984,
				host: 'localhost',
				user: '',
				password: '',
				database: 'test'
			})

			c.connect()

			c.loadDocument({keys: ['name', 'age'], type: 'not_a_person'}, function(error, doc) {
				error.error.should.match('not_found');
			});
			
			this.should.assert_later()
		end
	end
	
	describe 'createView with mocked connection'
		before
			lastDocument = {}
			
			c = new connector.connector({
				port: 5984,
				host: 'localhost',
				user: '',
				password: '',
				database: 'development'
			})
			
			c.connection = {
				
				saveDoc: function(documentName, document) {
					lastDocument = document
				},
				
				getDoc: function(documentName, callback) {
					callback(null, null);
				},
				
			}
			
			c.stackProcessor = {
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
			c = new connector.connector({
				port: 5984,
				host: 'localhost',
				user: '',
				password: '',
				database: 'test'
			});
			c.connect();
			
			c.createView({
				keys: ['name', 'type', 'age'],
				type: 'two_view_test'
			})
			
			c.createView({
				keys: ['type', 'name', 'age'],
				type: 'two_view_test'
			})
			
			endtableCore = new endtable.Core({
				database: 'test'
			});
			
			// Examine the design created.
			setTimeout(function() {
				endtableCore.loadDocument('_design/two_view_test', function(error, doc) {
					(typeof doc.views.by_name_type_age).should.equal('object');
					(typeof doc.views.by_type_name_age).should.equal('object');
				});
			}, 205);
	
			this.should.assert_later()
		end
	end
end