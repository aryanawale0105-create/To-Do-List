class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.searchQuery = '';

        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.taskList = document.getElementById('taskList');
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.emptyState = document.getElementById('emptyState');

        // Analytics
        this.statTotal = document.getElementById('statTotal');
        this.statCompleted = document.getElementById('statCompleted');
        this.statPending = document.getElementById('statPending');
        this.progressBar = document.getElementById('progressBar');
    }

    bindEvents() {
        this.taskForm.addEventListener('submit', (e) => this.addTask(e));
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        this.taskList.addEventListener('click', (e) => this.handleListActions(e));
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    addTask(e) {
        e.preventDefault();
        const title = this.taskInput.value.trim();
        if (!title) return;

        const newTask = {
            id: Date.now().toString(),
            title,
            priority: this.prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveToStorage();
        this.render();

        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        this.saveToStorage();
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage();
        this.render();
    }

    handleSearch(e) {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
    }

    handleFilter(e) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    handleListActions(e) {
        const item = e.target.closest('.task-item');
        if (!item) return;

        const id = item.dataset.id;
        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(id);
        } else if (e.target.closest('.btn-delete')) {
            this.deleteTask(id);
        }
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            const matchesFilter =
                this.currentFilter === 'all' ||
                (this.currentFilter === 'completed' && task.completed) ||
                (this.currentFilter === 'pending' && !task.completed);

            const matchesSearch = task.title.toLowerCase().includes(this.searchQuery);

            return matchesFilter && matchesSearch;
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.statTotal.textContent = total;
        this.statCompleted.textContent = completed;
        this.statPending.textContent = pending;
        this.progressBar.style.width = `${percentage}%`;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
              <div class="task-left">
                <input 
                  type="checkbox" 
                  class="task-checkbox" 
                  ${task.completed ? 'checked' : ''} 
                />
                <span class="task-title">${this.escapeHTML(task.title)}</span>
              </div>
              <div class="task-right">
                <span class="badge badge-${task.priority}">${task.priority}</span>
                <button class="btn-delete" title="Delete Task">
                  &#10005;
                </button>
              </div>
            </li>
          `).join('');
        }

        this.updateStats();
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});