describe 'ErrorHandler'
	describe 'registerCallback'
		it 'should register a callback that will be executed when an error is raised in the system'
		
			var handlerCalled = false
			var eh = new errorHandler.ErrorHandler()
			
			eh.registerCallback(function() {
				handlerCalled = true
			});
			eh.handleError({})
			
			handlerCalled.should.be_true()
		end
		
		it 'should be called when an endtable engine is initialized with the parameter errorCallback'
		
			var handlerCalled = false
			
			var endtableEngine = new endtable.Engine({
				errorCallback: function() {
					handlerCalled = true
				}
			})
			
			endtableEngine.errorHandler.handleError({})
			
			handlerCalled.should.be_true()
		end
	end
end