var name = 'inari';
var age = 20;
var gender = 'M';

window.onload = function() {
    // TODO: App Code goes here.
    // Display the todo items.
    // Open a connection to the datastore.
    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" }; // This line should only be needed if it is needed to support the object's constants for older browsers
    // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    todoDB.open(refreshTodos);
    // Get references to the form elements.
    var newTodoForm = document.getElementById('new-todo-form');
    var newTodoInput = document.getElementById('new-todo');

    // Handle new todo item form submissions.
    newTodoForm.onsubmit = function() {
        // Get the todo text.
        var text = newTodoInput.value;

        // Check to make sure the text is not blank (or just spaces).
        if (text.replace(/ /g, '') != '') {
            // Create the todo item.
            gender = gender === 'F' ? 'M' : 'F';
            todoDB.createTodo(text, name, age++, gender, 0, function(todo) {
                refreshTodos();
            });
        }

        // Reset the input field.
        newTodoInput.value = '';

        // Don't send the form.
        return false;
    };
};

function refreshTodos() {
    todoDB.fetchTodos(function(todos) {
        var todoList = document.getElementById('todo-items');
        todoList.innerHTML = '';

        for (var i = 0; i < todos.length; i++) {
            // Read the todo items backwards (most recent first).
            var todo = todos[(todos.length - 1 - i)];

            var li = document.createElement('li');
            li.id = 'todo-' + todo.id;
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.className = "todo-checkbox";
            checkbox.setAttribute("data-id", todo.id);

            li.appendChild(checkbox);

            var span = document.createElement('span');
            span.innerHTML = todo.text;

            li.appendChild(span);

            var edit = document.createElement('input');
            edit.type = "text";
            edit.value = todo.text;

            updatingText(li, span, edit, todo);

            todoList.appendChild(li);

            // Setup an event listener for the checkbox.
            checkbox.addEventListener('click', function(e) {
                var id = parseInt(e.target.getAttribute('data-id'));

                todoDB.deleteTodo(id, refreshTodos);
            });
        }

    });
}

function updatingText(li, span, edit, todo) {
    span.addEventListener('click', function(e) {
        li.appendChild(edit);
        edit.select();
    });

    edit.addEventListener('keypress', function(e) {
        var key = e.keyCode;
        if (key === 13) {
            todoDB.updateTodo(edit.value, todo.id, refreshTodos);
            li.removeChild(edit);
        }
    });
}