// れいのToDo - タスク管理モジュール
export class TodoManager {
    constructor() {
        this.todos = [];
        this.loadTodos();
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            this.todos = JSON.parse(saved);
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    addTodo(text, dueDate = '', dueTime = '', repeatType = 'none') {
        const sanitizedText = text.trim().substring(0, 200);
        
        if (!sanitizedText) {
            return { success: false, message: 'タスク内容を入力してね〜？😊' };
        }

        let dueDateTime = null;
        if (dueDate) {
            dueDateTime = new Date(dueDate);
            if (dueTime) {
                const [hours, minutes] = dueTime.split(':');
                dueDateTime.setHours(parseInt(hours), parseInt(minutes));
            }
        }

        const todo = {
            id: Date.now(),
            text: sanitizedText,
            completed: false,
            createdAt: new Date(),
            dueDate: dueDateTime,
            repeatType: repeatType,
            isRepeated: false
        };

        this.todos.push(todo);
        this.saveTodos();
        
        const encouragementMessages = [
            `「${sanitizedText}」追加したよ〜♡ 一緒に頑張ろうね！`,
            `新しいタスクだね〜✨ れいも応援してるよ♪`,
            `「${sanitizedText}」、きっとできるよ〜！ファイト〜♡`,
            `タスク追加完了〜♪ れいと一緒だから大丈夫だよ〜✨`
        ];
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        
        return { success: true, message: randomMessage, todo };
    }

    toggleComplete(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return { success: false };
        
        const wasCompleted = todo.completed;
        todo.completed = !todo.completed;
        
        this.saveTodos();
        
        if (!wasCompleted && todo.completed) {
            const completionMessages = [
                'やったね〜♡ れい嬉しい〜✨',
                'お疲れさま〜♪ すごいじゃない〜！',
                '完了おめでとう〜♡ れいも誇らしいよ〜',
                '素晴らしい〜✨ その調子だよ〜♪'
            ];
            const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
            
            return { 
                success: true, 
                completed: true, 
                message: randomMessage,
                todo,
                expGain: 10
            };
        }
        
        return { success: true, completed: false, todo };
    }

    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return { success: false };
        
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        
        return { success: true, message: 'タスクを削除したよ〜' };
    }

    getTodos() {
        return this.todos;
    }

    getIncompleteTodos() {
        return this.todos.filter(todo => !todo.completed);
    }

    getCompletedTodos() {
        return this.todos.filter(todo => todo.completed);
    }

    getProgress() {
        if (this.todos.length === 0) return 0;
        const completedCount = this.getCompletedTodos().length;
        return Math.round((completedCount / this.todos.length) * 100);
    }
}
