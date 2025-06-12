// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-items');
const searchInput = document.querySelector('.search-box input');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-todos');
const progressBar = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let currentSort = 'date';

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Load theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Todo Class
class Todo {
    constructor(content, category, priority, dueDate) {
        this.id = Date.now();
        this.content = content;
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = false;
        this.createdAt = new Date();
    }
}

// Add Todo
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const content = document.getElementById('todo-content').value;
    const category = document.querySelector('input[name="category"]:checked').value;
    const priority = document.getElementById('priority').value;
    const dueDate = document.getElementById('due-date').value;

    const todo = new Todo(content, category, priority, dueDate);
    todos.push(todo);
    saveTodos();
    renderTodos();
    todoForm.reset();
});

// Save Todos
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateProgress();
}

// Update Progress
function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completed} of ${total} tasks completed`;
}

// Toggle Todo
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Filter Todos
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.textContent.toLowerCase();
        renderTodos();
    });
});

// Sort Todos
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTodos();
});

// Search Todos
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    renderTodos(searchTerm);
});

// Format Date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render Todos
function renderTodos(searchTerm = '') {
    let filteredTodos = [...todos];

    // Apply search
    if (searchTerm) {
        filteredTodos = filteredTodos.filter(todo =>
            todo.content.toLowerCase().includes(searchTerm)
        );
    }

    // Apply filter
    if (currentFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo =>
            currentFilter === 'completed' ? todo.completed : !todo.completed
        );
    }

    // Apply sort
    filteredTodos.sort((a, b) => {
        switch (currentSort) {
            case 'date':
                return b.createdAt - a.createdAt;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'name':
                return a.content.localeCompare(b.content);
            default:
                return 0;
        }
    });

    // Render todos
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.category}" data-id="${todo.id}">
            <label class="checkbox">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span class="checkmark"></span>
            </label>
            <div class="todo-content">
                <p>${todo.content}</p>
                <div class="todo-details">
                    <span class="priority ${todo.priority}">${todo.priority}</span>
                    ${todo.dueDate ? `<span class="due-date">Due: ${formatDate(todo.dueDate)}</span>` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})" aria-label="Delete task">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Initial render
renderTodos(); 