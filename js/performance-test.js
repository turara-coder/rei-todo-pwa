// れいのToDo - パフォーマンステスト
class PerformanceTest {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    async runTests() {
        console.log('🚀 れいのToDo パフォーマンステスト開始');
        
        await this.testTodoOperations();
        await this.testUIUpdates();
        await this.testDataPersistence();
        await this.testMemoryUsage();
        
        this.displayResults();
    }

    async testTodoOperations() {
        console.log('📝 タスク操作パフォーマンステスト');
        
        const startTime = performance.now();
        
        // 100個のタスクを追加
        for (let i = 0; i < 100; i++) {
            const result = app.todoManager.addTodo(`テストタスク ${i}`);
            if (!result.success) {
                console.error(`タスク追加失敗: ${i}`);
            }
        }
        
        const addTime = performance.now() - startTime;
        
        // 50個のタスクを完了
        const toggleStartTime = performance.now();
        const todos = app.todoManager.getTodos();
        for (let i = 0; i < 50; i++) {
            app.todoManager.toggleComplete(todos[i].id);
        }
        const toggleTime = performance.now() - toggleStartTime;
        
        // 25個のタスクを削除
        const deleteStartTime = performance.now();
        for (let i = 50; i < 75; i++) {
            app.todoManager.deleteTodo(todos[i].id);
        }
        const deleteTime = performance.now() - deleteStartTime;
        
        this.results.push({
            test: 'タスク操作',
            add: `${addTime.toFixed(2)}ms (100件)`,
            toggle: `${toggleTime.toFixed(2)}ms (50件)`,
            delete: `${deleteTime.toFixed(2)}ms (25件)`
        });
    }

    async testUIUpdates() {
        console.log('🎨 UI更新パフォーマンステスト');
        
        const startTime = performance.now();
        
        // UI更新を100回実行
        for (let i = 0; i < 100; i++) {
            app.updateAllDisplays();
        }
        
        const updateTime = performance.now() - startTime;
        
        this.results.push({
            test: 'UI更新',
            time: `${updateTime.toFixed(2)}ms (100回)`,
            average: `${(updateTime / 100).toFixed(2)}ms/回`
        });
    }

    async testDataPersistence() {
        console.log('💾 データ永続化パフォーマンステスト');
        
        const startTime = performance.now();
        
        // データ保存を100回実行
        for (let i = 0; i < 100; i++) {
            app.todoManager.saveTodos();
            app.expSystem.saveExpData();
        }
        
        const saveTime = performance.now() - startTime;
        
        // データ読み込みを100回実行
        const loadStartTime = performance.now();
        for (let i = 0; i < 100; i++) {
            app.todoManager.loadTodos();
            app.expSystem.loadExpData();
        }
        const loadTime = performance.now() - loadStartTime;
        
        this.results.push({
            test: 'データ永続化',
            save: `${saveTime.toFixed(2)}ms (100回)`,
            load: `${loadTime.toFixed(2)}ms (100回)`
        });
    }

    async testMemoryUsage() {
        console.log('🧠 メモリ使用量テスト');
        
        if (performance.memory) {
            const memory = performance.memory;
            this.results.push({
                test: 'メモリ使用量',
                used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
            });
        } else {
            this.results.push({
                test: 'メモリ使用量',
                message: 'このブラウザではメモリ情報を取得できません'
            });
        }
    }

    displayResults() {
        console.log('📊 テスト結果:');
        console.table(this.results);
        
        // HTML要素に結果を表示
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            font-family: monospace;
            font-size: 0.8rem;
        `;
        
        resultDiv.innerHTML = `
            <h3>🚀 パフォーマンステスト結果</h3>
            <pre>${JSON.stringify(this.results, null, 2)}</pre>
            <button onclick="this.parentElement.remove()">閉じる</button>
        `;
        
        document.body.appendChild(resultDiv);
    }
}

// テスト実行用の関数
window.runPerformanceTest = async function() {
    const test = new PerformanceTest();
    await test.runTests();
};

// コンソールメッセージ
console.log('🧪 パフォーマンステストを実行するには: runPerformanceTest() を実行してください');
