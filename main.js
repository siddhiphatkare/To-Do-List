// Initialize todos array
let todos = [];

window.addEventListener('load', () => {
	// Get todos from localStorage
	todos = JSON.parse(localStorage.getItem('todos')) || [];
	
	const nameInput = document.querySelector('#name');
	const newTodoForm = document.querySelector('#new-todo-form');

	const username = localStorage.getItem('username') || '';
	nameInput.value = username;

	nameInput.addEventListener('change', (e) => {
		localStorage.setItem('username', e.target.value);
	})

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

		// Reset the form
		e.target.reset();

		DisplayTodos();
	})

	DisplayTodos();

	// Add notification system
	function requestNotificationPermission() {
		if ('Notification' in window) {
			Notification.requestPermission();
		}
	}

	function checkDueTodos() {
		const now = new Date();
		todos.forEach(todo => {
			if (todo.dueDate && !todo.done && !todo.notified) {
				const dueDate = new Date(todo.dueDate);
				const timeDiff = dueDate - now;
				
				// Notify 30 minutes before due
				if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) {
					new Notification('Todo Due Soon', {
						body: `"${todo.content}" is due in ${Math.round(timeDiff / 60000)} minutes`,
						icon: '/favicon.ico'
					});
					todo.notified = true;
					localStorage.setItem('todos', JSON.stringify(todos));
				}
				
				// Notify when overdue
				if (timeDiff < 0 && Math.abs(timeDiff) <= 60 * 1000) {
					new Notification('Todo Overdue', {
						body: `"${todo.content}" is now overdue!`,
						icon: '/favicon.ico'
					});
					todo.notified = true;
					localStorage.setItem('todos', JSON.stringify(todos));
				}
			}
		});
	}

	// Request notification permission when page loads
	requestNotificationPermission();
	
	// Check for due todos every minute
	setInterval(checkDueTodos, 60000);
})

function DisplayTodos() {
	const todoList = document.querySelector('#todo-list');
	if (!todoList) return; // Guard clause if element not found
	
	todoList.innerHTML = "";

	if (todos.length === 0) {
		todoList.innerHTML = `
			<div class="empty-state">
				<img src="empty-state.svg" alt="No todos">
				<p>No todos yet! Add one above.</p>
			</div>
		`;
		return;
	}

	todos.forEach(todo => {
		const todoItem = document.createElement('div');
		todoItem.classList.add('todo-item');
		todoItem.classList.add(todo.category);

		todoItem.innerHTML = `
			<label>
				<input type="checkbox" ${todo.done ? 'checked' : ''}>
				<span class="bubble ${todo.category}"></span>
			</label>
			<div class="todo-content">
				<input type="text" value="${todo.content}" readonly>
				${todo.dueDate ? `<span class="due-date ${isOverdue(todo.dueDate) && !todo.done ? 'overdue' : ''}">${formatDueDate(todo.dueDate)}</span>` : ''}
				<span class="date-added">${formatDate(todo.createdAt)}</span>
			</div>
			<div class="actions">
				<button class="edit">Edit</button>
				<button class="delete">Delete</button>
			</div>
		`;

		// Add priority indicator
		const priorityIndicator = document.createElement('span');
		priorityIndicator.classList.add('priority', todo.priority || 'medium');
		todoItem.insertBefore(priorityIndicator, todoItem.firstChild);

		if (todo.done) {
			todoItem.classList.add('done');
		}

		// Add event listeners
		const checkbox = todoItem.querySelector('input[type="checkbox"]');
		checkbox.addEventListener('change', (e) => {
			todo.done = e.target.checked;
			todo.completedAt = e.target.checked ? new Date().getTime() : null;
			localStorage.setItem('todos', JSON.stringify(todos));

			if (todo.done) {
				todoItem.classList.add('done');
				playSound('complete');
				animateTodoCompletion(todoItem);
			} else {
				todoItem.classList.remove('done');
			}

			updateProgress();
			updateStatistics();
		});

		const editButton = todoItem.querySelector('.edit');
		editButton.addEventListener('click', () => {
			const input = todoItem.querySelector('.todo-content input');
			input.removeAttribute('readonly');
			input.focus();
			input.addEventListener('blur', () => {
				input.setAttribute('readonly', true);
				todo.content = input.value;
				localStorage.setItem('todos', JSON.stringify(todos));
			});
		});

		const deleteButton = todoItem.querySelector('.delete');
		deleteButton.addEventListener('click', () => {
			todos = todos.filter(t => t !== todo);
			localStorage.setItem('todos', JSON.stringify(todos));
			DisplayTodos();
			updateProgress();
			updateStatistics();
		});

		todoList.appendChild(todoItem);
	});

	updateProgress();
	updateStatistics();
}

// Dark mode toggle with icon update
const themeToggle = document.querySelector('#theme-toggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

function updateThemeIcons() {
	if (document.body.classList.contains('dark-mode')) {
		sunIcon.style.display = 'block';
		moonIcon.style.display = 'none';
	} else {
		sunIcon.style.display = 'none';
		moonIcon.style.display = 'block';
	}
}

function applyDarkMode(isDark) {
	if (isDark) {
		document.body.classList.add('dark-mode');
	} else {
		document.body.classList.remove('dark-mode');
	}
	localStorage.setItem('darkMode', isDark);
	updateThemeIcons();
}

// Load saved theme on page load
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
applyDarkMode(savedDarkMode);

// Theme toggle event
themeToggle.addEventListener('click', () => {
	const isDark = !document.body.classList.contains('dark-mode');
	applyDarkMode(isDark);
});

// Update user name in dashboard welcome
function updateUserName() {
	const username = localStorage.getItem('username') || 'User';
	const userNameElements = document.querySelectorAll('.user-name');
	userNameElements.forEach(el => {
		el.textContent = username;
	});
}

window.addEventListener('load', () => {
	updateUserName();
});

// Filter buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
	btn.addEventListener('click', () => {
		filterButtons.forEach(b => b.classList.remove('active'));
		btn.classList.add('active');
		const filter = btn.textContent.toLowerCase();
		filterTodos(filter);
	});
});

function filterTodos(filter) {
	const todoItems = document.querySelectorAll('.todo-item');
	todoItems.forEach(item => {
		if (filter === 'all' || item.classList.contains(filter)) {
			item.style.display = 'flex';
		} else {
			item.style.display = 'none';
		}
	});
}

// Search input event
if (searchInput) {
	searchInput.addEventListener('input', (e) => {
		searchTerm = e.target.value.toLowerCase();
		DisplayTodos();
	});
}

// Add these new functions

// Add priority to todo creation
function createTodo(content, category) {
	return {
		id: Date.now(),
		content: content,
		category: category,
		done: false,
		createdAt: new Date().getTime(),
		completedAt: null,
		dueDate: document.querySelector('#dueDate')?.value || null,
		priority: document.querySelector('input[name="priority"]:checked')?.value || 'medium',
		notified: false
	};
}

// Add progress calculation
function updateProgress() {
	const total = todos.length;
	const completed = todos.filter(todo => todo.done).length;
	const progress = total === 0 ? 0 : (completed / total) * 100;
	
	const progressBar = document.querySelector('.progress-bar-fill');
	if (progressBar) {
		progressBar.style.width = `${progress}%`;
	}
}

// Format date
function formatDate(timestamp) {
	return new Date(timestamp).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// Add loading state
function showLoading() {
	const loader = document.createElement('div');
	loader.classList.add('loading');
	document.querySelector('.main').appendChild(loader);
}

function hideLoading() {
	const loader = document.querySelector('.loading');
	if (loader) {
		loader.remove();
	}
}

// Add search functionality
const searchInput = document.querySelector('#search-todos');
let searchTerm = '';

searchInput.addEventListener('input', (e) => {
	searchTerm = e.target.value.toLowerCase();
	DisplayTodos();
});

// Modify DisplayTodos to include search filtering
async function DisplayTodos() {
	showLoading();
	
	try {
		const todoList = document.querySelector('#todo-list');
		todoList.innerHTML = "";

		// Filter todos based on search term
		const filteredTodos = todos.filter(todo => 
			todo.content.toLowerCase().includes(searchTerm)
		);

		if (filteredTodos.length === 0) {
			todoList.innerHTML = `
				<div class="empty-state">
					<img src="empty-state.svg" alt="No todos">
					<p>${todos.length === 0 ? 'No todos yet! Add one above.' : 'No matching todos found.'}</p>
				</div>
			`;
			return;
		}

		// Add progress bar
		const progressSection = document.createElement('div');
		progressSection.innerHTML = `
			<div class="progress-bar">
				<div class="progress-bar-fill"></div>
			</div>
		`;
		todoList.appendChild(progressSection);

		filteredTodos.forEach(todo => {
			const todoItem = document.createElement('div');
			todoItem.classList.add('todo-item');
			todoItem.classList.add(todo.category);
			todoItem.dataset.id = todo.id;

			const label = document.createElement('label');
			const input = document.createElement('input');
			const span = document.createElement('span');
			const content = document.createElement('div');
			const actions = document.createElement('div');
			const edit = document.createElement('button');
			const deleteButton = document.createElement('button');

			input.type = 'checkbox';
			input.checked = todo.done;
			span.classList.add('bubble');
			if (todo.category == 'personal') {
				span.classList.add('personal');
			} else {
				span.classList.add('business');
			}
			content.classList.add('todo-content');
			actions.classList.add('actions');
			edit.classList.add('edit');
			deleteButton.classList.add('delete');

			content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
			edit.innerHTML = 'Edit';
			deleteButton.innerHTML = 'Delete';

			label.appendChild(input);
			label.appendChild(span);
			actions.appendChild(edit);
			actions.appendChild(deleteButton);
			todoItem.appendChild(label);
			todoItem.appendChild(content);
			todoItem.appendChild(actions);

			todoList.appendChild(todoItem);

			if (todo.done) {
				todoItem.classList.add('done');
			}
			
			input.addEventListener('change', (e) => {
				todo.done = e.target.checked;
				localStorage.setItem('todos', JSON.stringify(todos));

				if (todo.done) {
					todoItem.classList.add('done');
				} else {
					todoItem.classList.remove('done');
				}

				DisplayTodos()

			})

			edit.addEventListener('click', (e) => {
				const input = content.querySelector('input');
				input.removeAttribute('readonly');
				input.focus();
				input.addEventListener('blur', (e) => {
					input.setAttribute('readonly', true);
					todo.content = e.target.value;
					localStorage.setItem('todos', JSON.stringify(todos));
					DisplayTodos()

				})
			})

			deleteButton.addEventListener('click', (e) => {
				todos = todos.filter(t => t != todo);
				localStorage.setItem('todos', JSON.stringify(todos));
				DisplayTodos()
			})

			// Add these lines when creating todo items
			const dateSpan = document.createElement('span');
			dateSpan.classList.add('date-added');
			dateSpan.textContent = formatDate(todo.createdAt);
			content.appendChild(dateSpan);

			const priorityIndicator = document.createElement('span');
			priorityIndicator.classList.add('priority', todo.priority);
			todoItem.insertBefore(priorityIndicator, label);

			// Add due date display
			if (todo.dueDate) {
				const dueDate = document.createElement('span');
				dueDate.classList.add('due-date');
				if (isOverdue(todo.dueDate) && !todo.done) {
					dueDate.classList.add('overdue');
				}
				dueDate.textContent = formatDueDate(todo.dueDate);
				content.appendChild(dueDate);
			}

		})

		updateProgress()
	} finally {
		hideLoading();
	}

	enableDragAndDrop();
	enableKeyboardNavigation();

	updateStatistics();
}

// Add smooth scrolling to new items
function scrollToNewItem(element) {
	element.scrollIntoView({ behavior: 'smooth' });
}

// Add sorting functionality
const sortSelect = document.querySelector('#sort-todos');
sortSelect.addEventListener('change', () => {
	sortTodos(sortSelect.value);
	DisplayTodos();
});

function sortTodos(sortBy) {
	todos.sort((a, b) => {
		switch (sortBy) {
			case 'date-asc':
				return a.createdAt - b.createdAt;
			case 'date-desc':
				return b.createdAt - a.createdAt;
			case 'priority':
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				return priorityOrder[b.priority] - priorityOrder[a.priority];
			case 'due-date':
				if (!a.dueDate) return 1;
				if (!b.dueDate) return -1;
				return new Date(a.dueDate) - new Date(b.dueDate);
			case 'alphabetical':
				return a.content.localeCompare(b.content);
			default:
				return b.createdAt - a.createdAt;
		}
	});
}

// Add function to format due date
function formatDueDate(dueDate) {
	if (!dueDate) return '';
	const date = new Date(dueDate);
	const now = new Date();
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);

	if (date.toDateString() === now.toDateString()) {
		return 'Due Today';
	} else if (date.toDateString() === tomorrow.toDateString()) {
		return 'Due Tomorrow';
	} else {
		return `Due ${date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		})}`;
	}
}

// Add function to check if todo is overdue
function isOverdue(dueDate) {
	if (!dueDate) return false;
	return new Date(dueDate) < new Date();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
	// Ctrl/Cmd + Enter to add new todo
	if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
		document.querySelector('#new-todo-form').submit();
	}
	
	// Ctrl/Cmd + D to toggle dark mode
	if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
		document.body.classList.toggle('dark-mode');
	}
	
	// Ctrl/Cmd + / to focus search
	if ((e.ctrlKey || e.metaKey) && e.key === '/') {
		document.querySelector('#search-todos').focus();
	}
});

// Add keyboard navigation for todo items
function enableKeyboardNavigation() {
	const todoItems = document.querySelectorAll('.todo-item');
	let currentFocus = -1;

	document.addEventListener('keydown', (e) => {
		// Up/Down arrows to navigate todos
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			
			if (e.key === 'ArrowDown') {
				currentFocus = Math.min(currentFocus + 1, todoItems.length - 1);
			} else {
				currentFocus = Math.max(currentFocus - 1, 0);
			}
			
			if (currentFocus >= 0) {
				todoItems[currentFocus].querySelector('input[type="text"]').focus();
			}
		}
		
		// Enter to toggle todo completion when focused
		if (e.key === 'Enter' && document.activeElement.closest('.todo-item')) {
			const checkbox = document.activeElement.closest('.todo-item').querySelector('input[type="checkbox"]');
			checkbox.checked = !checkbox.checked;
			checkbox.dispatchEvent(new Event('change'));
		}
		
		// Delete to remove todo when focused
		if (e.key === 'Delete' && document.activeElement.closest('.todo-item')) {
			document.activeElement.closest('.todo-item').querySelector('.delete').click();
		}
	});
}

// Add drag and drop functionality
function enableDragAndDrop() {
	const todoList = document.querySelector('#todo-list');
	const todoItems = todoList.querySelectorAll('.todo-item');
	
	todoItems.forEach(item => {
		item.setAttribute('draggable', true);
		
		item.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('text/plain', item.dataset.id);
			item.classList.add('dragging');
		});
		
		item.addEventListener('dragend', () => {
			item.classList.remove('dragging');
		});
		
		item.addEventListener('dragover', (e) => {
			e.preventDefault();
			const draggingItem = todoList.querySelector('.dragging');
			const siblings = [...todoList.querySelectorAll('.todo-item:not(.dragging)')];
			const nextSibling = siblings.find(sibling => {
				const rect = sibling.getBoundingClientRect();
				const center = rect.top + rect.height / 2;
				return e.clientY < center;
			});
			
			if (nextSibling) {
				todoList.insertBefore(draggingItem, nextSibling);
			} else {
				todoList.appendChild(draggingItem);
			}
		});
		
		item.addEventListener('drop', (e) => {
			e.preventDefault();
			const draggedId = e.dataTransfer.getData('text/plain');
			const draggedIndex = todos.findIndex(t => t.id.toString() === draggedId);
			const dropIndex = [...todoList.querySelectorAll('.todo-item')].indexOf(item);
			
			const [draggedTodo] = todos.splice(draggedIndex, 1);
			todos.splice(dropIndex, 0, draggedTodo);
			localStorage.setItem('todos', JSON.stringify(todos));
		});
	});
}

// Add statistics tracking
function updateStatistics() {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	// Calculate completed todos today
	const completedToday = todos.filter(todo => {
		const todoDate = new Date(todo.completedAt);
		return todo.done && todoDate >= today;
	}).length;
	
	// Calculate productivity score
	const totalTodos = todos.length;
	const completedTodos = todos.filter(todo => todo.done).length;
	const productivityScore = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
	
	// Calculate streak
	const streak = calculateStreak();
	
	// Update DOM
	document.getElementById('completed-today').textContent = completedToday;
	document.getElementById('productivity-score').textContent = `${productivityScore}%`;
	document.getElementById('current-streak').textContent = `${streak} days`;
	
	// Update progress bar
	const progressFill = document.querySelector('.progress-fill');
	if (progressFill) {
		progressFill.style.width = `${productivityScore}%`;
	}
}

function calculateStreak() {
	const completedDates = todos
		.filter(todo => todo.done && todo.completedAt)
		.map(todo => new Date(todo.completedAt).toDateString());
	
	let streak = 0;
	let currentDate = new Date();
	
	while (completedDates.includes(currentDate.toDateString())) {
		streak++;
		currentDate.setDate(currentDate.getDate() - 1);
	}
	
	return streak;
}

// Add animation for completed todos
function animateTodoCompletion(todoItem) {
	todoItem.style.animation = 'none';
	todoItem.offsetHeight; // Trigger reflow
	todoItem.style.animation = 'completedTodo 0.5s var(--animation-timing)';
}

// Add sound effects
function playSound(sound) {
	const audio = new Audio(`sounds/${sound}.mp3`);
	audio.play().catch(e => console.log('Audio playback failed:', e));
}

// Add these to your existing event listeners
document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
	checkbox.addEventListener('change', (e) => {
		if (e.target.checked) {
			playSound('complete');
			animateTodoCompletion(e.target.closest('.todo-item'));
		}
	});
});