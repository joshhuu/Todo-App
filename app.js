// State Management
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date';
let searchTerm = '';
let editingTaskId = null;

// DOM Elements
const elements = {
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    categorySelect: document.getElementById('categorySelect'),
    prioritySelect: document.getElementById('prioritySelect'),
    dueDateInput: document.getElementById('dueDateInput'),
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    filterButtons: document.querySelectorAll('[data-filter]'),
    sortButtons: document.querySelectorAll('[data-sort]'),
    clearCompletedBtn: document.getElementById('clearCompleted'),
    themeToggle: document.getElementById('themeToggle'),
    toast: document.getElementById('toast'),
    totalCount: document.getElementById('totalCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    editModal: document.getElementById('editModal'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskInput: document.getElementById('editTaskInput'),
    editCategorySelect: document.getElementById('editCategorySelect'),
    editPrioritySelect: document.getElementById('editPrioritySelect'),
    editDueDateInput: document.getElementById('editDueDateInput'),
    modalClose: document.querySelector('.modal-close'),
    modalCancel: document.querySelector('.modal-cancel')
};

function init() {
    loadTasks();
    loadTheme();
    renderTasks();
    updateStats();
    attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
    // Form submission
    elements.taskForm.addEventListener('submit', handleAddTask);
    
    // Search
    elements.searchInput.addEventListener('input', handleSearch);
    
    // Filter buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter, btn));
    });
    
    // Sort buttons
    elements.sortButtons.forEach(btn => {
        btn.addEventListener('click', () => handleSort(btn.dataset.sort, btn));
    });
    
    // Clear completed
    elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Task list (event delegation)
    elements.taskList.addEventListener('click', handleTaskActions);
    elements.taskList.addEventListener('change', handleTaskToggle);
    
    // Edit modal
    elements.editTaskForm.addEventListener('submit', handleEditSubmit);
    elements.modalClose.addEventListener('click', closeEditModal);
    elements.modalCancel.addEventListener('click', closeEditModal);
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) closeEditModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleAddTask(e) {
    e.preventDefault();
    
    const title = elements.taskInput.value.trim();
    
    if (!title) {
        showToast('Please enter a task description', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        title,
        completed: false,
        priority: elements.prioritySelect.value,
        category: elements.categorySelect.value,
        dueDate: elements.dueDateInput.value,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    
    elements.taskForm.reset();
    elements.taskInput.focus();
    
    showToast('Task added successfully! ✓', 'success');
}

function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    saveTasks();
    renderTasks();
    updateStats();
    
    showToastWithUndo('Task deleted', () => {
        tasks.splice(taskIndex, 0, deletedTask);
        saveTasks();
        renderTasks();
        updateStats();
        showToast('Task restored', 'success');
    });
}

function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
    
    const message = task.completed ? 'Task completed! 🎉' : 'Task marked as active';
    showToast(message, 'success');
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    editingTaskId = id;
    
    elements.editTaskInput.value = task.title;
    elements.editCategorySelect.value = task.category;
    elements.editPrioritySelect.value = task.priority;
    elements.editDueDateInput.value = task.dueDate || '';
    
    elements.editModal.classList.add('show');
    elements.editModal.setAttribute('aria-hidden', 'false');
    elements.editTaskInput.focus();
}

function closeEditModal() {
    elements.editModal.classList.remove('show');
    elements.editModal.setAttribute('aria-hidden', 'true');
    editingTaskId = null;
    elements.editTaskForm.reset();
}

function handleEditSubmit(e) {
    e.preventDefault();
    
    const title = elements.editTaskInput.value.trim();
    
    if (!title) {
        showToast('Task description cannot be empty', 'error');
        return;
    }
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;
    
    task.title = title;
    task.category = elements.editCategorySelect.value;
    task.priority = elements.editPrioritySelect.value;
    task.dueDate = elements.editDueDateInput.value;
    
    saveTasks();
    renderTasks();
    closeEditModal();
    
    showToast('Task updated successfully! ✓', 'success');
}

function handleClearCompleted() {
    const completedTasks = tasks.filter(t => t.completed);
    
    if (completedTasks.length === 0) {
        showToast('No completed tasks to clear', 'info');
        return;
    }
    
    if (!confirm(`Delete ${completedTasks.length} completed task(s)?`)) {
        return;
    }
    
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateStats();
    
    showToast(`${completedTasks.length} task(s) cleared`, 'success');
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        elements.taskList.innerHTML = '';
        elements.emptyState.classList.add('show');
        return;
    }
    
    elements.emptyState.classList.remove('show');
    
    elements.taskList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
}

function createTaskHTML(task) {
    const isOverdue = isTaskOverdue(task);
    const dueDateText = formatDueDate(task.dueDate);
    
    return `
        <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
            >
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-badge badge-category">${escapeHtml(task.category)}</span>
                    <span class="task-badge badge-priority ${task.priority}">
                        ${getPriorityIcon(task.priority)} ${task.priority}
                    </span>
                    ${task.dueDate ? `<span class="task-date ${isOverdue ? 'overdue-text' : ''}">📅 ${dueDateText}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" data-action="edit" aria-label="Edit task">✏️</button>
                <button class="task-btn delete-btn" data-action="delete" aria-label="Delete task">🗑️</button>
            </div>
        </div>
    `;
}

function getFilteredTasks() {
    let filtered = [...tasks];
    
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    switch (currentFilter) {
        case 'active':
            filtered = filtered.filter(t => !t.completed);
            break;
        case 'completed':
            filtered = filtered.filter(t => t.completed);
            break;
        case 'low':
        case 'medium':
        case 'high':
            filtered = filtered.filter(t => t.priority === currentFilter);
            break;
    }
    
    if (currentSort === 'date') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
    
    return filtered;
}

function handleFilter(filter, button) {
    currentFilter = filter;
    
    elements.filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    renderTasks();
}

function handleSort(sort, button) {
    currentSort = sort;
    
    elements.sortButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    renderTasks();
}

function handleSearch(e) {
    searchTerm = e.target.value.trim();
    renderTasks();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    
    elements.totalCount.textContent = total;
    elements.activeCount.textContent = active;
    elements.completedCount.textContent = completed;
}

// Local Storage
function saveTasks() {
    try {
        localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Failed to save tasks:', error);
        showToast('Failed to save tasks', 'error');
    }
}

function loadTasks() {
    try {
        const saved = localStorage.getItem('taskflow-tasks');
        tasks = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to load tasks:', error);
        tasks = [];
    }
}

// Theme
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        elements.themeToggle.querySelector('.theme-icon').textContent = '🌙';
        localStorage.setItem('taskflow-theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        elements.themeToggle.querySelector('.theme-icon').textContent = '☀️';
        localStorage.setItem('taskflow-theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('taskflow-theme') || 'light';
    const body = document.body;
    
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        elements.themeToggle.querySelector('.theme-icon').textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        elements.themeToggle.querySelector('.theme-icon').textContent = '🌙';
    }
}

function handleTaskActions(e) {
    if (!e.target.dataset.action) return;
    
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = parseInt(taskItem.dataset.id);
    const action = e.target.dataset.action;
    
    if (action === 'edit') {
        openEditModal(taskId);
    } else if (action === 'delete') {
        deleteTask(taskId);
    }
}

function handleTaskToggle(e) {
    if (!e.target.classList.contains('task-checkbox')) return;
    
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = parseInt(taskItem.dataset.id);
    toggleTaskComplete(taskId);
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape' && elements.editModal.classList.contains('show')) {
        closeEditModal();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.searchInput.focus();
    }
}

function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function showToastWithUndo(message, undoCallback) {
    elements.toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.closest('.toast').dataset.undoFn()" 
                style="background: var(--accent-primary); color: white; border: none; 
                       padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Undo
        </button>
    `;
    elements.toast.className = 'toast show info';
    elements.toast.dataset.undoFn = undoCallback;
    
    window._undoCallback = undoCallback;
    elements.toast.querySelector('button').onclick = () => {
        window._undoCallback();
        elements.toast.classList.remove('show');
    };
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
        delete window._undoCallback;
    }, 5000);
}

function isTaskOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
}

function formatDueDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPriorityIcon(priority) {
    const icons = {
        low: '🟢',
        medium: '🟡',
        high: '🔴'
    };
    return icons[priority] || '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
