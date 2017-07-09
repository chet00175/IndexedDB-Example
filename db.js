var todoDB = (function() {
    var tDB = {};
    var datastore = null;

    // TODO: Add methods for interacting with the database here.

    /**
     * Open a connection to the datastore.
     */
    tDB.open = function(callback) {
        // Database version.
        var version = 1;

        var request = window.indexedDB.open('todos', version);

        // Handle datastore upgrades.
        request.onupgradeneeded = function(e) {
            var db = e.target.result;

            e.target.transaction.onerror = tDB.onerror;

            // Delete the old datastore.
            if (db.objectStoreNames.contains('todo')) {
                db.deleteObjectStore('todo');
            }

            // Create a new datastore.
            var store = db.createObjectStore('todo', {
                keyPath: 'id',
                autoIncrement: true
            });
        };

        // Handle successful datastore access.
        request.onsuccess = function(e) {
            // Get a reference to the DB.
            datastore = e.target.result;

            // Execute the callback.
            callback();

            tDB.fetchAgeGender(function() {});
        };

        // Handle errors when opening the datastore.
        request.onerror = tDB.onerror;
    };

    /**
     * Fetch all of the todo items in the datastore.
     */
    tDB.fetchTodos = function(callback) {
        var db = datastore;
        var to = 'todo';
        var transaction = db.transaction([to], 'readwrite');
        var objStore = transaction.objectStore('todo');

        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = objStore.openCursor(keyRange);

        var todos = [];

        transaction.oncomplete = function(e) {
            // Execute the callback function.
            callback(todos);
        };

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (!!result == false) {
                return;
            }

            todos.push(result.value);

            result.continue();
        };

        cursorRequest.onerror = tDB.onerror;
    };

    tDB.fetchAgeGender = function(callback) {
        var db = datastore;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objStore = transaction.objectStore('todo');

        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = objStore.openCursor(keyRange);

        var todos = [];

        transaction.oncomplete = function(e) {
            // Execute the callback function.
            callback(todos);
        };

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (!!result == false) {
                return;
            }

            if (result.value.gender === 'F' && result.value.age === 22) {
                //console.log(result.value);
            }

            todos.push(result.value);

            result.continue();
        };

        cursorRequest.onerror = tDB.onerror;
    };

    /**
     * Create a new todo item.
     */
    tDB.createTodo = function(text, name, age, gender, date, callback) {
        // Get a reference to the db.
        var db = datastore;

        // Initiate a new transaction.
        var todo = 'todo';
        var transaction = db.transaction([todo], 'readwrite');

        // Get the datastore.
        var objStore = transaction.objectStore(todo);

        // Create a timestamp for the todo item.
        //var timestamp = new Date().getTime();

        var todo = {
            'text': text,
            'name': name,
            'age': age,
            'gender': gender,
            'date': date
        };

        // Create the datastore request.
        var request = objStore.put(todo);

        // Handle a successful datastore put.
        request.onsuccess = function(e) {
            // Execute the callback function.
            callback(todo);
        };

        // Handle errors.
        request.onerror = tDB.onerror;
    };

    tDB.updateTodo = function(text, timestamp, callback) {
        // Get a reference to the db.
        var db = datastore;

        // Initiate a new transaction.
        var transaction = db.transaction(['todo'], 'readwrite');

        // Get the datastore.
        var objStore = transaction.objectStore('todo');

        var oldDataRequest = objStore.get(timestamp);

        oldDataRequest.onerror = function(event) {
            // Handle errors!
        };

        oldDataRequest.onsuccess = function(e) {
            // Create an object for the todo item.
            var todo = {
                'text': text,
                'id': timestamp,
                'name': oldDataRequest.result.name,
                'age': oldDataRequest.result.age,
                'gender': oldDataRequest.result.gender,
                'date': oldDataRequest.result.date
            };

            // Create the datastore request.
            var request = objStore.put(todo);

            // Handle a successful datastore put.
            request.onsuccess = function(e) {
                // Execute the callback function.
                callback(todo);
            };

            // Handle errors.
            request.onerror = tDB.onerror;
        };
    };

    /**
     * Delete a todo item.
     */
    tDB.deleteTodo = function(id, callback) {
        var db = datastore;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objStore = transaction.objectStore('todo');

        var request = objStore.delete(id);

        request.onsuccess = function(e) {
            callback();
        }

        request.onerror = function(e) {
            console.log(e);
        }
    };

    tDB.deleteAllTodos = function(callback) {
        var db = datastore;
        var transaction = db.transaction(['todo'], 'readwrite');
        var objStore = transaction.objectStore('todo');

        transaction.oncomplete = function(e) {
            // Execute the callback function.
            callback();
        };

        objStore.openCursor().onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
                if (cursor.value.id === 34 || cursor.value.id === 37) {
                    var request = cursor.delete();
                    request.onsuccess = function() {};
                }
                cursor.continue();
            }
        };
    };

    // Export the tDB object.
    return tDB;
}());