describe 'MonitoredObject'
	before
		engine = new endtable.Engine()
		engine.connector = {
			loadDocument: function(params, callback) {
				callback({
					error: 'not_found'
				})
			},
			createView: function(params, callback) {
				createViewCalled = true
			},
			saveDocument: function() {
				
			}
		}
	end
	
	describe 'loadValidators'
		it 'should find validators attached to object'
		
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
					engine: engine,
					type: 'person'
				}
			);
			person = new Person();
			person.validators.age[1]().should.be_true();
			person.validators.name[0]().should.be_true();
		end
	end
	
	describe '__defineSetter__'
		it 'should raise an error if a validator fails when an instance variable is set'
		
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
					engine: engine,
					type: 'person'
				}
			);
			
			var errorRaised = false;
			
			person = new Person({
				age: 25,
				errorCallback: function(error) {
					error.error.should.equal('validation');
					errorRaised = true;
				}
			});
						
			person.age = 'Ben';
			
			setTimeout(function() {
				errorRaised.should.be_true();
			}, TIMEOUT_INTERVAL);
			
		end
	end
end