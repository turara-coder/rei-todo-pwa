// れいのToDo - 機能テストスクリプト
class FunctionalTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    async runAllTests() {
        console.log('🧪 れいのToDo 機能テスト開始');
        
        this.testTodoAddition();
        this.testTodoCompletion();
        this.testTodoDeletion();
        this.testDataPersistence();
        this.testExpSystem();
        this.testUIUpdates();
        this.testFormValidation();
        this.testOfflineMode();
        
        this.displayTestResults();
    }

    test(name, condition, message = '') {
        const passed = condition;
        this.testResults.push({
            name,
            status: passed ? '✅ PASS' : '❌ FAIL',
            message: message || (passed ? '正常' : '異常')
        });
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${name}: PASS`);
        } else {
            this.failedTests++;
            console.error(`❌ ${name}: FAIL - ${message}`);
        }
    }

    testTodoAddition() {
        console.log('📝 タスク追加テスト');
        
        const initialCount = app.todoManager.getTodos().length;
        const result = app.todoManager.addTodo('テストタスク');
        const newCount = app.todoManager.getTodos().length;
        
        this.test('タスク追加', result.success, 'タスクが正常に追加されること');
        this.test('タスク数増加', newCount === initialCount + 1, 'タスク数が1増加すること');
        
        // 空のタスク追加テスト
        const emptyResult = app.todoManager.addTodo('');
        this.test('空タスク拒否', !emptyResult.success, '空のタスクは追加されないこと');
        
        // 長いタスク名のテスト
        const longText = 'あ'.repeat(300);
        const longResult = app.todoManager.addTodo(longText);
        const addedTodo = app.todoManager.getTodos().find(t => t.text.length <= 200);
        this.test('長いタスク名制限', addedTodo && addedTodo.text.length <= 200, 'タスク名が200文字以下に制限されること');
    }

    testTodoCompletion() {
        console.log('✅ タスク完了テスト');
        
        // 未完了のタスクを追加
        const addResult = app.todoManager.addTodo('完了テスト用タスク');
        const todo = addResult.todo;
        
        this.test('初期状態未完了', !todo.completed, 'タスクの初期状態が未完了であること');
        
        // タスクを完了
        const completeResult = app.todoManager.toggleComplete(todo.id);
        this.test('完了処理成功', completeResult.success, 'タスク完了処理が成功すること');
        this.test('完了状態変更', completeResult.completed, 'タスクが完了状態になること');
        this.test('経験値獲得', completeResult.expGain > 0, '経験値が獲得されること');
        
        // 再度トグルして未完了に戻す
        const uncompleteResult = app.todoManager.toggleComplete(todo.id);
        this.test('未完了に戻す', uncompleteResult.success && !uncompleteResult.completed, '完了タスクを未完了に戻せること');
    }

    testTodoDeletion() {
        console.log('🗑️ タスク削除テスト');
        
        const addResult = app.todoManager.addTodo('削除テスト用タスク');
        const todo = addResult.todo;
        const initialCount = app.todoManager.getTodos().length;
        
        const deleteResult = app.todoManager.deleteTodo(todo.id);
        const newCount = app.todoManager.getTodos().length;
        
        this.test('削除処理成功', deleteResult.success, 'タスク削除処理が成功すること');
        this.test('タスク数減少', newCount === initialCount - 1, 'タスク数が1減少すること');
        
        // 存在しないタスクの削除テスト
        const invalidDeleteResult = app.todoManager.deleteTodo(99999);
        this.test('存在しないタスク削除', !invalidDeleteResult.success, '存在しないタスクの削除は失敗すること');
    }

    testDataPersistence() {
        console.log('💾 データ永続化テスト');
        
        // テストデータを保存
        const testTodo = app.todoManager.addTodo('永続化テスト用タスク');
        const initialTodos = app.todoManager.getTodos();
        
        // 手動でローカルストレージに保存
        app.todoManager.saveTodos();
        
        // ローカルストレージから直接データを確認
        const savedData = localStorage.getItem('todos');
        const parsedData = JSON.parse(savedData);
        
        this.test('データ保存', savedData !== null && parsedData.length > 0, 'データがローカルストレージに保存されること');
        this.test('データ復元', parsedData.length === initialTodos.length, 'データが正確に保存されること');
        
        // 経験値データのテスト
        const initialExp = app.expSystem.getCurrentExp();
        app.expSystem.saveExpData();
        
        const savedExpData = localStorage.getItem('expData');
        const parsedExpData = JSON.parse(savedExpData);
        
        this.test('経験値保存', parsedExpData && parsedExpData.currentExp === initialExp, '経験値データが保存されること');
    }

    testExpSystem() {
        console.log('⭐ 経験値システムテスト');
        
        const initialExp = app.expSystem.getCurrentExp();
        const initialLevel = app.expSystem.getCurrentLevel();
        
        // 経験値追加
        const expResult = app.expSystem.addExp(50);
        
        this.test('経験値追加', expResult.expGained === 50, '経験値が正確に追加されること');
        this.test('現在経験値更新', app.expSystem.getCurrentExp() === initialExp + 50, '現在経験値が更新されること');
        
        // レベルアップテスト（大量の経験値を追加）
        const levelUpResult = app.expSystem.addExp(1000);
        
        this.test('レベルアップ発生', levelUpResult.levelUp, 'レベルアップが発生すること');
        this.test('レベル上昇', app.expSystem.getCurrentLevel() > initialLevel, 'レベルが上昇すること');
        this.test('レベルアップメッセージ', levelUpResult.messages.length > 0, 'レベルアップメッセージが生成されること');
    }

    testUIUpdates() {
        console.log('🎨 UI更新テスト');
        
        // プログレスバーのテスト
        const initialProgress = app.todoManager.getProgress();
        app.ui.updateProgress(75);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        this.test('プログレスバー更新', progressFill && progressFill.style.width === '75%', 'プログレスバーが正確に更新されること');
        this.test('プログレステキスト更新', progressText && progressText.textContent === '75%', 'プログレステキストが更新されること');
        
        // れいのメッセージテスト
        const testMessage = 'テストメッセージだよ〜♡';
        app.ui.showReiMessage(testMessage);
        
        const reiMood = document.getElementById('rei-mood');
        this.test('れいメッセージ表示', reiMood && reiMood.textContent === testMessage, 'れいのメッセージが表示されること');
        
        // 経験値バーの更新テスト
        const expData = app.expSystem.getExpData();
        app.ui.updateExpDisplay({
            ...expData,
            expToNext: app.expSystem.getExpToNext()
        });
        
        const currentLevel = document.getElementById('current-level');
        this.test('レベル表示更新', currentLevel && parseInt(currentLevel.textContent) === expData.currentLevel, 'レベル表示が更新されること');
    }

    testFormValidation() {
        console.log('📋 フォームバリデーションテスト');
        
        const todoInput = document.getElementById('todo-input');
        const todoForm = document.getElementById('todo-form');
        
        if (todoInput && todoForm) {
            // 空のフォーム送信テスト
            todoInput.value = '';
            const initialCount = app.todoManager.getTodos().length;
            
            // フォーム送信をシミュレート
            const submitEvent = new Event('submit');
            todoForm.dispatchEvent(submitEvent);
            
            const newCount = app.todoManager.getTodos().length;
            this.test('空フォーム拒否', newCount === initialCount, '空のフォーム送信が拒否されること');
            
            // 正常なフォーム送信テスト
            todoInput.value = 'フォームテスト用タスク';
            todoForm.dispatchEvent(submitEvent);
            
            const finalCount = app.todoManager.getTodos().length;
            this.test('正常フォーム送信', finalCount === initialCount + 1, '正常なフォーム送信が処理されること');
        } else {
            this.test('フォーム要素存在', false, 'フォーム要素が見つかりません');
        }
    }

    testOfflineMode() {
        console.log('📵 オフラインモードテスト');
        
        // オンライン状態の確認
        const initialOnlineState = navigator.onLine;
        this.test('初期オンライン状態', typeof initialOnlineState === 'boolean', 'オンライン状態が取得できること');
        
        // ローカルストレージの利用可能性テスト
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.test('ローカルストレージ利用可能', true, 'ローカルストレージが利用可能であること');
        } catch (e) {
            this.test('ローカルストレージ利用可能', false, 'ローカルストレージが利用できません');
        }
        
        // Service Workerの登録確認
        if ('serviceWorker' in navigator) {
            this.test('Service Worker対応', true, 'Service Workerが対応されていること');
        } else {
            this.test('Service Worker対応', false, 'Service Workerが対応されていません');
        }
    }

    displayTestResults() {
        const totalTests = this.passedTests + this.failedTests;
        const passRate = Math.round((this.passedTests / totalTests) * 100);
        
        console.log('\n📊 テスト結果サマリー:');
        console.log(`総テスト数: ${totalTests}`);
        console.log(`成功: ${this.passedTests}`);
        console.log(`失敗: ${this.failedTests}`);
        console.log(`成功率: ${passRate}%`);
        
        // 詳細結果をテーブル表示
        console.table(this.testResults);
        
        // HTML要素に結果を表示
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 0.8rem;
        `;
        
        const resultsHtml = this.testResults.map(result => 
            `<div style="margin: 0.5rem 0; padding: 0.25rem; border-left: 3px solid ${result.status.includes('PASS') ? '#27ae60' : '#e74c3c'};">
                <strong>${result.name}</strong>: ${result.status}<br>
                <small>${result.message}</small>
            </div>`
        ).join('');
        
        resultDiv.innerHTML = `
            <h3>🧪 機能テスト結果</h3>
            <div style="margin: 1rem 0; padding: 0.5rem; background: #ecf0f1; border-radius: 5px;">
                <strong>成功率: ${passRate}% (${this.passedTests}/${totalTests})</strong>
            </div>
            <div>${resultsHtml}</div>
            <button onclick="this.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem; border: none; background: #3498db; color: white; border-radius: 5px; cursor: pointer;">閉じる</button>
        `;
        
        document.body.appendChild(resultDiv);
    }
}

// テスト実行用の関数
window.runFunctionalTest = async function() {
    const test = new FunctionalTest();
    await test.runAllTests();
};

// コンソールメッセージ
console.log('🧪 機能テストを実行するには: runFunctionalTest() を実行してください');
