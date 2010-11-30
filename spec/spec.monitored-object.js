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
end