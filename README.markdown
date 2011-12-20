Endtable
========

Endtable is an experimental ORM built on top of Node.js and CouchDB.

The concept? long-lived, self-monitoring, objects that persist only periodically as modifications are made to them.

This paradigm reduces the frequency with which writes are made to the database, and works well for domains such as games.

The Engine Object
-----------------

A single engine object is instantiated and passed as a dependency to an Endtable Class:

```javascript
var engine = new endtable.Engine({
	database: 'people_example',
	host: 'localhost',
	user: '',
	password: '',
	errorCallback: function(error) {
		// When views aren't found they raise a warning.
		sys.puts(JSON.stringify(error));
	}
});
```
 
The Error Callback
------------------

Errors that occur in Endtable are propagated up to the _errorCallback_ passed to the Engine's constructor.

Error objects provide the following information:

* _error.error_ the raw error message.
* _error.reason_ the reason for the error.
* _error.raisedByObject_ the underlying object that raised the error.
* _error.raisedByMethod_ the method that caused the error.
* _error.raisedByParameters_ the parameters passed to the method that caused the error.

Endtable Classes
----------------

Endtable Classes describe the ORM-backed objects.

```javascript
var Dog = endtable.Object.extend(
	{
		bark: function() {
			sys.puts('Woof!!!');
		}
	},
	{
		engine: engine,
		type: 'dog',
		customViews: [
		function lowerName(doc) {
			if(doc.type=='dog')
			  emit(doc.name.toLowerCase(),doc); 
			},
		function otherNamedView(doc) { ... }
		]
	}
);
```

- The first parameter contains all the methods that will be inherited by objects that instantiate the class.
- The second parameter provides meta information:
    - _engine_ is an instance of the Endtable Engine described previously.
    - _type_ represents the corresponding CouchDB resource name.
    - _customViews_ is an array containing custom view functions to be
      created on the couchdb server
      - all the functions *must* be named functions

Creating ORM-Backed Objects
---------------------------

Once you've created some Endtable Classes simply instantiate them to create auto-persisting CouchDB-backed objects.

```javascript
var dog = new Dog({
	name: 'Spike',
	owner: 'Benjamin Coe',
	coat: 'soft'
})

var dog2 = new Dog({
	name: 'Fluffy',
	owner: 'Eric Brown',
	coat: 'rough'
}, function(err, message) {
	// Called after the first save.
});
```

The first parameter passed to the constructor provides the instance variables for the object.

An optional callback can be provided for the second parameter and will be executed the first time the object persists to CouchDB.

Loading Objects
---------------

You can lookup objects based on any of their keys.

Simply call the _load_ method on an Endtable Class:


```javascript
Dog.load({
	keys: ['owner', 'coat'],
	key: ['Benjamin Coe', 'soft']
}, function(error, obj) {
	if (!error) {
		obj[0].bark();
	}
})
```

* _keys_ indicates the keys that an object will be looked up by. A CouchDB view will be generated to allow for this lookup.
* _key_ is a set of concrete values that correspond with the keys described in keys.

You can also load objects based on a range of values.

```javascript
Person.load({
	keys: 'age',
	startkey: 28,
	endkey: 50
}, function(error, obj) {
	if (!error) {
		for (var i = 0; i < obj.length; i++) {
			obj[i].sayName();
		}
	}
})
```

This will load individuals with an age ranging from 28 to 50.

You can also load an object with a custom view function applied to it.

```javascript
Dog.load({
	keys: 'name',
    customView: 'lowerName'
}, function(error, obj) {
	if (!error) {
		for (var i = 0; i < obj.length; i++) {
			obj[i].sayName();
		}
	}
})
```
* _customView_ is the name of a custom view function you defined when you defined the object
* You can add in other parameters to filter the results as shown in previous examples


Examples
--------

Run _node examples/person.js_ to get an idea of Endtable in action.

Contributing to Endtable
----------------------
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.
* Please try not to mess with the Rakefile, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

Copyright
---------

Copyright (c) 2011 Benjamin Coe. See LICENSE.txt for
further details.
