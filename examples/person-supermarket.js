/* this is a modified person.js for supermarket */
var sys = require('sys');
sys.puts('Running... Hit CTRL-C To Exit.');

var endtable = require('endtable');

var engine = new endtable.Engine({
    database: 'people_example.db',
    connectorClass: 'supermarket-connector'
});

var Person = endtable.Object.extend(
    {
        sayName: function() {
            sys.puts('Hello, my name is ' + this.name + '!');
        }
    },
    {
        engine: engine,
        type: 'person'
    }
);

function populateData() {
    sys.puts('Populating fake data.');
    
    var person = new Person({
        name: 'Christian',
        age: 28,
        sex: 'male'
    }, function(error, obj) {
        sys.puts('Created person.')
    })

    var ben = new Person({
        name: 'Benjamin Coe',
        age: 27,
        sex: 'male',
        interests: ['climbing']
    })
    
    setTimeout(function() {
        ben.awesome = true;
    }, 250);
    
    setTimeout(function() {
        ben.interests.push('programming');
    }, 500);
    
    person = new Person({
        name: 'Sally Johnson',
        age: 24,
        sex: 'female'
    })
    
    person = new Person({
        name: 'JBoss',
        age: 30,
        sex: 'male'
    })
}

function performQuery() {
    setTimeout(function() {
        sys.puts('Performing query on all objects.');
        
        new Person().load(
            function (record) { return true },
            function (err, records) {
                if (err) throw new Error(err);
                records.forEach(function (record) {
                    record.sayName();
                });
        })
    }, 1000);
}

function performQuery2() {
    setTimeout(function() {
        sys.puts('Performing query on specific key.');
        
        new Person().load(
            function (record) { return record.age > 24 && record.age < 50 },
            function(err, records) {
                if (err) throw new Error(err);
                records.forEach(function (record) {
                    record.sayName();
                });
        })
    }, 2000);
}

(function resetDatabase(callback) {
    sys.puts('Resetting database.'); 
    engine.connector.deleteDatabase(function() {
        engine.connector.createDatabase(function(error, doc) {
            callback();
        });
    });
})(function() {
    populateData();
    performQuery();
    performQuery2();
});

