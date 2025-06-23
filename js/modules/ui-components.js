// れいのToDo - UIコンポーネントモジュール
export class UIComponents {
    constructor() {
        this.reiMood = document.getElementById('rei-mood');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.expFill = document.getElementById('exp-fill');
        this.currentLevel = document.getElementById('current-level');
        this.currentExp = document.getElementById('current-exp');
        this.expToNext = document.getElementById('exp-to-next');
        this.streakCount = document.getElementById('streak-count');
        this.streakBest = document.getElementById('streak-best');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
    }

    showReiMessage(message, duration = 3000) {
        if (this.reiMood) {
            const originalMessage = this.reiMood.textContent;
            this.reiMood.textContent = message;
            this.reiMood.style.animation = 'messageFloat 0.5s ease-out';
            
            setTimeout(() => {
                this.reiMood.style.animation = '';
                this.reiMood.textContent = originalMessage;
            }, duration);
        }
    }

    updateProgress(percentage) {
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${percentage}%`;
        }
    }

    updateExpDisplay(expData) {
        if (this.expFill) {
            const progress = Math.round((expData.currentExp / expData.expToNext) * 100);
            this.expFill.style.width = `${progress}%`;
        }
        
        if (this.currentLevel) {
            this.currentLevel.textContent = expData.currentLevel;
        }
        
        if (this.currentExp) {
            this.currentExp.textContent = expData.currentExp;
        }
        
        if (this.expToNext) {
            this.expToNext.textContent = expData.expToNext;
        }
    }

    updateStreakDisplay(streakData) {
        if (this.streakCount) {
            this.streakCount.textContent = streakData.current;
        }
        
        if (this.streakBest) {
            this.streakBest.textContent = streakData.best;
        }
    }

    displayTodos(todos) {
        if (!this.todoList) return;
        
        this.todoList.innerHTML = '';
        
        const incompleteTodos = todos.filter(todo => !todo.completed);
        const completedTodos = todos.filter(todo => todo.completed);
        
        if (todos.length === 0) {
            if (this.emptyState) this.emptyState.style.display = 'block';
            return;
        }
        
        if (this.emptyState) this.emptyState.style.display = 'none';
        
        const allTodos = [...incompleteTodos, ...completedTodos];
        
        allTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = this.createTodoHTML(todo);
            this.todoList.appendChild(li);
        });
    }

    createTodoHTML(todo) {
        const dueDateDisplay = todo.dueDate ? 
            `<span class="due-date">${this.formatDueDate(todo.dueDate)}</span>` : '';
        
        const repeatDisplay = todo.repeatType !== 'none' ? 
            `<span class="repeat-indicator">🔄 ${this.getRepeatTypeText(todo.repeatType)}</span>` : '';
        
        return `
            <div class="todo-content">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleComplete(${todo.id})" />
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                ${dueDateDisplay}
                ${repeatDisplay}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
        `;
    }

    formatDueDate(dueDate) {
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `<span style="color: #e74c3c;">期限切れ</span>`;
        } else if (diffDays === 0) {
            return `<span style="color: #f39c12;">今日</span>`;
        } else if (diffDays === 1) {
            return `<span style="color: #f39c12;">明日</span>`;
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    getRepeatTypeText(repeatType) {
        const types = {
            'daily': '毎日',
            'weekly': '毎週',
            'monthly': '毎月'
        };
        return types[repeatType] || '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(title, message, duration = 5000) {
        // 簡単な通知システム
        const notification = document.createElement('div');
        notification.className = 'rei-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
}
