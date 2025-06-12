// Modify the checkbox event listener in DisplayTodos function
checkbox.addEventListener('change', (e) => {
    todo.done = e.target.checked;
    todo.completedAt = e.target.checked ? new Date().getTime() : null;
    localStorage.setItem('todos', JSON.stringify(todos));

    if (todo.done) {
        todoItem.classList.add('done');
        playSound('complete');
        animateTodoCompletion(todoItem);
        // Dispatch event for dashboard
        document.dispatchEvent(new CustomEvent('taskCompleted', { 
            detail: todo 
        }));
    } else {
        todoItem.classList.remove('done');
    }

    updateProgress();
    updateStatistics();
    notifyTodoUpdate();
});

// Modify the form submit event listener
newTodoForm.addEventListener('submit', e => {
    e.preventDefault();

    const todo = {
        id: Date.now(),
        content: e.target.elements.content.value,
        category: e.target.elements.category.value,
        done: false,
        createdAt: new Date().getTime(),
        dueDate: e.target.elements.dueDate?.value || null,
        priority: document.querySelector('input[name="priority"]:checked')?.value || 'medium'
    };

    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));

    // Dispatch event for dashboard
    document.dispatchEvent(new CustomEvent('taskAdded'));

    // Reset the form
    e.target.reset();

    DisplayTodos();
    notifyTodoUpdate();
});

// Modify the delete button event listener
deleteButton.addEventListener('click', () => {
    const wasCompleted = todo.done;
    todos = todos.filter(t => t !== todo);
    localStorage.setItem('todos', JSON.stringify(todos));
    
    // Dispatch event for dashboard
    document.dispatchEvent(new CustomEvent('taskDeleted', { 
        detail: { wasCompleted } 
    }));
    
    DisplayTodos();
    updateProgress();
    updateStatistics();
    notifyTodoUpdate();
});

// Add this function after todo updates
function notifyTodoUpdate() {
    window.dispatchEvent(new Event('todoUpdated'));
}

// Add progress calculation
function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.done).length;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${completed} of ${total} tasks completed`;
    }
} 