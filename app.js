// れいのToDo PWA版 JavaScript - 修正版
let deferredPrompt;
let isOnline = navigator.onLine;
let celebrationSystem = null;
let weatherSystem = null;
let anniversarySystem = null;
let notificationSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const dueDateInput = document.getElementById('due-date');
    const dueTimeInput = document.getElementById('due-time');
    const clearDatetimeBtn = document.getElementById('clear-datetime');
    const repeatTypeSelect = document.getElementById('repeat-type');
    const nextRepeatDateSpan = document.getElementById('next-repeat-date');
    const badgeSettingsBtn = document.getElementById('badge-settings-btn');
    const badgeModal = document.getElementById('badge-modal');
    const badgeModalClose = document.getElementById('badge-modal-close');
    const themeSettingsBtn = document.getElementById('theme-settings-btn');
    const themeModal = document.getElementById('theme-modal');
    const themeModalClose = document.getElementById('theme-modal-close');
    const statusBtn = document.getElementById('status-btn');
    const statusModal = document.getElementById('status-modal');
    const statusModalClose = document.getElementById('status-modal-close');
    
    // デバッグ: ステータスボタンの存在確認
    console.log('ステータスボタン要素:', statusBtn);
    console.log('ステータスモーダル要素:', statusModal);
    if (!statusBtn) {
        console.error('ステータスボタンが見つかりません!');
    } else {
        console.log('ステータスボタンが正常に取得されました');
    }
    const reiToast = document.getElementById('rei-toast');
    const reiToastMessage = document.getElementById('rei-toast-message');
    const reiToastClose = document.getElementById('rei-toast-close');
    const currentBadgeElement = document.getElementById('current-badge');
    const emptyState = document.getElementById('empty-state');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const installBanner = document.getElementById('install-banner');
    const installButton = document.getElementById('install-button');
    const dismissBanner = document.getElementById('dismiss-banner');
    const offlineNotice = document.getElementById('offline-notice');

    // ========== グローバル変数 ==========
    let todos = [];
    let streakData = {
        current: 0,
        best: 0,
        lastCompletionDate: null
    };
    let expData = {
        currentExp: 0,
        currentLevel: 1,
        totalExp: 0
    };
    let badgeData = {
        unlockedBadges: ['first_meeting'],
        selectedBadge: 'first_meeting',
        stats: {
            totalCompleted: 0,
            dailyTasksCompleted: {},
            streakRecord: 0,
            currentLevel: 1
        }
    };
    let themeData = {
        currentTheme: 'default',
        unlockedThemes: ['default']
    };
    
    // 完了タスクカウンターのデータ
    let completionData = {
        todayCompleted: 0,
        totalCompleted: 0,
        dailyCompletions: {},
        lastResetDate: null
    };

    const themeDefinitions = {
        default: {
            id: 'default',
            name: 'ピンクパステル',
            icon: '🌸',
            description: 'れいちゃんと一緒の優しいピンク',
            unlockLevel: 1,
            unlockMessage: 'れいちゃんとの最初のテーマだよ〜♡'
        },
        sakura: {
            id: 'sakura',
            name: '桜咲く春',
            icon: '🌸',
            description: '桜舞い散る春の暖かさ',
            unlockLevel: 5,
            unlockMessage: 'レベル5達成！桜のテーマが解放されたよ〜🌸'
        },
        ocean: {
            id: 'ocean',
            name: '青い海',
            icon: '🌊',
            description: '爽やかな海の青さ',
            unlockLevel: 10,
            unlockMessage: 'レベル10達成！海のテーマで爽やかにいこう〜🌊'
        },
        forest: {
            id: 'forest',
            name: '緑の森',
            icon: '🌲',
            description: '自然豊かな森の緑',
            unlockLevel: 15,
            unlockMessage: 'レベル15達成！森の自然に包まれよう〜🌲'
        },
        sunset: {
            id: 'sunset',
            name: '夕焼け空',
            icon: '🌅',
            description: '美しい夕焼けの温もり',
            unlockLevel: 20,
            unlockMessage: 'レベル20達成！夕焼けの美しさに包まれよう〜🌅'
        },
        space: {
            id: 'space',
            name: '宇宙の神秘',
            icon: '🌌',
            description: '神秘的な宇宙の深さ',
            unlockLevel: 30,
            unlockMessage: 'レベル30達成！宇宙の神秘を感じよう〜🌌'
        },
        rainbow: {
            id: 'rainbow',
            name: '虹色の夢',
            icon: '🌈',
            description: '七色に輝く希望の虹',
            unlockLevel: 50,
            unlockMessage: 'レベル50達成！虹色の夢が現実に〜🌈'
        }
    };

    // ========== 基本関数 ==========
    function showReiMessage(message, duration = 5000) {
        // 旧バージョンのメッセージ表示も保持（フォールバック）
        const reiMood = document.getElementById('rei-mood');
        if (reiMood) {
            const originalMessage = reiMood.textContent;
            reiMood.textContent = message;
            reiMood.style.animation = 'messageFloat 0.5s ease-out';
            
            setTimeout(() => {
                reiMood.style.animation = '';
                reiMood.textContent = originalMessage;
            }, duration);
        }
        
        // 新しいトーストメッセージ表示
        showReiToast(message, duration);
    }
    
    function showReiToast(message, duration = 5000) {
        if (!reiToast || !reiToastMessage) return;
        
        // 既存のタイマーをクリア
        if (reiToast.hideTimeout) {
            clearTimeout(reiToast.hideTimeout);
            reiToast.hideTimeout = null;
        }
        if (reiToast.showTimeout) {
            clearTimeout(reiToast.showTimeout);
            reiToast.showTimeout = null;
        }
        
        // メッセージを設定
        reiToastMessage.textContent = message;
        
        // トーストを即座に表示状態にする
        reiToast.classList.remove('hidden');
        reiToast.classList.add('show');
        
        // 設定時間後に自動で非表示
        reiToast.hideTimeout = setTimeout(() => {
            hideReiToast();
        }, duration);
    }
    
    function hideReiToast() {
        if (!reiToast) return;
        
        // 既存のタイマーをクリア
        if (reiToast.hideTimeout) {
            clearTimeout(reiToast.hideTimeout);
            reiToast.hideTimeout = null;
        }
        if (reiToast.showTimeout) {
            clearTimeout(reiToast.showTimeout);
            reiToast.showTimeout = null;
        }
        
        // アニメーション付きで非表示
        reiToast.classList.remove('show');
        reiToast.showTimeout = setTimeout(() => {
            reiToast.classList.add('hidden');
        }, 300); // CSS transition時間と合わせる
    }

    function loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            todos = JSON.parse(saved);
        }
        displayTodos();
        updateProgress();
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function addTodo(text, dueDate = '', dueTime = '', repeatType = 'none') {
        const sanitizedText = text.trim().substring(0, 200);
        
        if (!sanitizedText) {
            showReiMessage('タスク内容を入力してね〜？😊');
            return;
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

        todos.push(todo);
        saveTodos();
        displayTodos();
        updateProgress();
        
        // メッセージ表示を少し遅延させて他の処理と競合しないようにする
        setTimeout(() => {
            const encouragementMessages = [
                `「${sanitizedText}」追加したよ〜♡ 一緒に頑張ろうね！`,
                `新しいタスクだね〜✨ れいも応援してるよ♪`,
                `「${sanitizedText}」、きっとできるよ〜！ファイト〜♡`,
                `タスク追加完了〜♪ れいと一緒だから大丈夫だよ〜✨`
            ];
            
            const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
            showReiMessage(randomMessage, 5000); // タスク追加メッセージ
        }, 100); // 他の処理完了後にメッセージ表示
    }

    function displayTodos() {
        if (!todoList) return;
        
        todoList.innerHTML = '';
        
        const incompleteTodos = todos.filter(todo => !todo.completed);
        const completedTodos = todos.filter(todo => todo.completed);
        
        if (todos.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        const allTodos = [...incompleteTodos, ...completedTodos];
        
        allTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = createTodoHTML(todo);
            todoList.appendChild(li);
        });
    }

    function createTodoHTML(todo) {
        const dueDateDisplay = todo.dueDate ? 
            `<span class="due-date">${formatDueDate(todo.dueDate)}</span>` : '';
        
        const repeatDisplay = todo.repeatType !== 'none' ? 
            `<span class="repeat-indicator">🔄 ${getRepeatTypeText(todo.repeatType)}</span>` : '';
        
        return `
            <div class="todo-content">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleComplete(${todo.id})" />
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueDateDisplay}
                ${repeatDisplay}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️</button>
        `;
    }

    function toggleComplete(id) {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        const wasCompleted = todo.completed;
        todo.completed = !todo.completed;
        
        if (!wasCompleted && todo.completed) {
            // タスク完了時 - 完了日時を記録
            todo.completedAt = new Date();
            addExp(10);
            updateStreakOnCompletion();
            updateDailyTaskRecord();
            updateCompletionCounter(true); // 完了カウンター増加
            
            setTimeout(() => {
                checkAndUnlockBadges();
            }, 1000);
            
            if (todo.repeatType !== 'none') {
                generateNextRepeatTask(todo);
            }
            
            const completionMessages = [
                'やったね〜♡ れい嬉しい〜✨',
                'お疲れさま〜♪ すごいじゃない〜！',
                '完了おめでとう〜♡ れいも誇らしいよ〜',
                '素晴らしい〜✨ その調子だよ〜♪'
            ];
            const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
            showReiMessage(randomMessage, 5000); // 完了メッセージ
            
            // 祝福アニメーション発動
            if (celebrationSystem) {
                const checkbox = document.querySelector(`input[onchange="toggleComplete(${id})"]`);
                if (checkbox) {
                    celebrationSystem.celebrateTaskCompletion(checkbox.parentElement);
                }
            }
        } else if (wasCompleted && !todo.completed) {
            // タスク未完了に戻した時 - 完了日時をクリア
            delete todo.completedAt;
            updateCompletionCounter(false); // 完了カウンター減少
            showReiMessage('タスクを未完了に戻したよ〜');
        }
        
        saveTodos();
        displayTodos();
        updateProgress();
    }

    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        displayTodos();
        updateProgress();
        showReiMessage('タスクを削除したよ〜');
    }

    // ========== モーダル関数 ==========
    function openBadgeModal() {
        if (!badgeModal) return;
        
        const badgeGrid = document.getElementById('badge-grid');
        if (!badgeGrid) return;
        
        const badges = getBadgeDefinitions();
        const currentBadgeData = getBadgeData();
        
        badgeGrid.innerHTML = '';
        
        badges.forEach(badge => {
            const isUnlocked = currentBadgeData.unlockedBadges.includes(badge.id);
            const isSelected = currentBadgeData.selectedBadge === badge.id;
            
            const badgeItem = document.createElement('div');
            badgeItem.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
            badgeItem.dataset.badgeId = badge.id;
            
            if (isUnlocked) {
                // 獲得済み称号：フル情報表示
                badgeItem.innerHTML = `
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-info">
                        <h4>${badge.title}</h4>
                        <p>${badge.description}</p>
                    </div>
                `;
                badgeItem.addEventListener('click', () => selectBadge(badge.id));
            } else {
                // 未獲得称号：情報を隠す
                badgeItem.innerHTML = `
                    <div class="badge-icon mystery-icon">❓</div>
                    <div class="badge-info">
                        <h4>??? の称号</h4>
                        <p>まだ獲得していない称号です</p>
                    </div>
                    <div class="lock-overlay">🔒</div>
                `;
            }
            
            badgeGrid.appendChild(badgeItem);
        });
        
        updateBadgeStats();
        badgeModal.classList.remove('hidden');
    }

    function closeBadgeModal() {
        if (badgeModal) {
            badgeModal.classList.add('hidden');
        }
    }

    function selectBadge(badgeId) {
        const badgeData = getBadgeData();
        badgeData.selectedBadge = badgeId;
        saveBadgeData(badgeData);
        
        updateBadgeDisplay();
        showReiMessage('称号を変更したよ〜♪ 素敵だね✨');
        
        document.querySelectorAll('.badge-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-badge-id="${badgeId}"]`)?.classList.add('selected');
        
        closeBadgeModal();
    }

    function openThemeModal() {
        if (!themeModal) return;
        
        const themeGrid = document.getElementById('theme-grid');
        if (!themeGrid) return;
        
        themeGrid.innerHTML = '';
        
        Object.values(themeDefinitions).forEach(theme => {
            const isUnlocked = themeData.unlockedThemes.includes(theme.id);
            const isActive = themeData.currentTheme === theme.id;
            
            const themeCard = document.createElement('div');
            themeCard.className = `theme-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
            themeCard.dataset.themeId = theme.id;
            
            themeCard.innerHTML = `
                <div class="theme-preview ${theme.id}">
                    ${!isUnlocked ? '<div class="theme-lock-icon">🔒</div>' : ''}
                    ${!isUnlocked ? `<div class="theme-unlock-level">Lv.${theme.unlockLevel}</div>` : ''}
                </div>
                <div class="theme-info">
                    <h4>${theme.icon} ${theme.name}</h4>
                    <p>${theme.description}</p>
                    ${!isUnlocked ? `<p style="color: #999; font-size: 0.7rem;">レベル${theme.unlockLevel}で解放</p>` : ''}
                </div>
            `;
            
            if (isUnlocked) {
                themeCard.addEventListener('click', () => selectTheme(theme.id));
            }
            
            themeGrid.appendChild(themeCard);
        });
        
        themeModal.classList.remove('hidden');
    }

    function closeThemeModal() {
        if (themeModal) {
            themeModal.classList.add('hidden');
        }
    }

    function selectTheme(themeId) {
        if (!themeData.unlockedThemes.includes(themeId)) {
            return;
        }
        
        themeData.currentTheme = themeId;
        saveThemeData();
        applyCurrentTheme();
        
        const theme = themeDefinitions[themeId];
        showReiMessage(`テーマを「${theme.name}」に変更したよ〜♪ ${theme.icon}`);
        
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-theme-id="${themeId}"]`)?.classList.add('active');
        
        document.body.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
        
        closeThemeModal();
    }

    // ========== ユーティリティ関数 ==========
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDueDate(date) {
        const now = new Date();
        const dueDate = new Date(date);
        const diffTime = dueDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今日';
        } else if (diffDays === 1) {
            return '明日';
        } else if (diffDays === -1) {
            return '昨日';
        } else if (diffDays > 0) {
            return `${diffDays}日後`;
        } else {
            return `${Math.abs(diffDays)}日前`;
        }
    }

    function getRepeatTypeText(repeatType) {
        const types = {
            'daily': '毎日',
            'weekly': '毎週',
            'monthly': '毎月'
        };
        return types[repeatType] || '';
    }

    function updateProgress() {
        if (!progressFill || !progressText) return;
        
        const totalTasks = todos.length;
        const completedTasks = todos.filter(todo => todo.completed).length;
        
        if (totalTasks === 0) {
            progressFill.style.width = '0%';
            progressText.textContent = '今日のタスクを追加しよう！';
            return;
        }
        
        const percentage = (completedTasks / totalTasks) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completedTasks}/${totalTasks} 完了 (${Math.round(percentage)}%)`;
        
        if (percentage === 100) {
            setTimeout(() => {
                showReiMessage('今日のタスク全部完了〜♡ すっごいじゃない〜✨');
            }, 500);
        }
    }

    // ========== 完了カウンター関数 ==========
    function updateCompletionCounter(isCompleting = true) {
        const today = new Date().toDateString();
        
        // 日付が変わったらリセット
        if (completionData.lastResetDate !== today) {
            completionData.todayCompleted = 0;
            completionData.lastResetDate = today;
        }
        
        if (isCompleting) {
            // 今日の完了数を増加
            completionData.todayCompleted++;
            completionData.totalCompleted++;
            
            // 日別記録を保存
            if (!completionData.dailyCompletions[today]) {
                completionData.dailyCompletions[today] = 0;
            }
            completionData.dailyCompletions[today]++;
            
            // 達成メッセージ
            showCompletionMessage();
        } else {
            // 完了を取り消す場合
            if (completionData.todayCompleted > 0) {
                completionData.todayCompleted--;
            }
            if (completionData.totalCompleted > 0) {
                completionData.totalCompleted--;
            }
            
            // 日別記録を調整
            if (completionData.dailyCompletions[today] && completionData.dailyCompletions[today] > 0) {
                completionData.dailyCompletions[today]--;
            }
        }
        
        // 表示を更新
        updateCompletionDisplay();
        
        // データを保存
        saveCompletionData();
    }
    
    function updateCompletionDisplay() {
        const todayElement = document.getElementById('today-completed-count');
        
        if (todayElement) {
            todayElement.textContent = completionData.todayCompleted;
        }
        
        // ステータスモーダル内の表示も更新
        updateStatusModalData();
    }
    
    function showCompletionMessage() {
        const today = completionData.todayCompleted;
        const total = completionData.totalCompleted;
        
        // 特別な数字での祝福メッセージ
        if (today === 5) {
            showReiMessage('今日5個も完了〜♡ 頑張ってるね〜✨');
        } else if (today === 10) {
            showReiMessage('今日10個完了〜！すごいじゃない〜♪');
        } else if (total % 50 === 0 && total > 0) {
            showReiMessage(`総完了数${total}個達成〜♡ れい感動しちゃう〜✨`);
        } else if (total % 100 === 0 && total > 0) {
            showReiMessage(`🎉 総完了数${total}個の大台達成〜！れいも誇らしいよ〜♡`);
        }
    }
    
    function resetDailyCompletion() {
        const today = new Date().toDateString();
        if (completionData.lastResetDate !== today) {
            completionData.todayCompleted = 0;
            completionData.lastResetDate = today;
            updateCompletionDisplay();
            saveCompletionData();
        }
    }
    
    function saveCompletionData() {
        localStorage.setItem('completionData', JSON.stringify(completionData));
    }
    
    function loadCompletionData() {
        const saved = localStorage.getItem('completionData');
        if (saved) {
            completionData = { ...completionData, ...JSON.parse(saved) };
        }
        
        // 日付が変わっていたらリセット
        resetDailyCompletion();
        
        // データの整合性をチェック・修正
        syncCompletionDataWithTodos();
        
        updateCompletionDisplay();
    }
    
    function syncCompletionDataWithTodos() {
        // 実際のtodosデータから今日の完了数を再計算
        const today = new Date().toDateString();
        const todaysCompletedTodos = todos.filter(todo => {
            if (!todo.completed) return false;
            
            // completedAtがない場合は今日とみなす（後方互換性）
            if (!todo.completedAt) return true;
            
            const completedDate = new Date(todo.completedAt).toDateString();
            return completedDate === today;
        });
        
        // 今日の完了数を実際のデータと同期
        const actualTodayCompleted = todaysCompletedTodos.length;
        if (completionData.todayCompleted !== actualTodayCompleted) {
            console.log(`今日の完了数を同期: ${completionData.todayCompleted} → ${actualTodayCompleted}`);
            completionData.todayCompleted = actualTodayCompleted;
            
            // 日別記録も更新
            if (!completionData.dailyCompletions[today]) {
                completionData.dailyCompletions[today] = 0;
            }
            completionData.dailyCompletions[today] = actualTodayCompleted;
            
            saveCompletionData();
        }
    }

    // ========== ステータスモーダル関数 ==========
    function showStatusModal() {
        if (statusModal) {
            updateStatusModalData();
            statusModal.classList.remove('hidden');
        }
    }
    
    function hideStatusModal() {
        if (statusModal) {
            statusModal.classList.add('hidden');
        }
    }
    
    function updateStatusModalData() {
        // 基本統計
        const modalTotalCompleted = document.getElementById('modal-total-completed');
        const modalStreakBest = document.getElementById('modal-streak-best');
        const modalTodayCompleted = document.getElementById('modal-today-completed');
        const modalActiveDays = document.getElementById('modal-active-days');
        
        if (modalTotalCompleted) {
            modalTotalCompleted.textContent = completionData.totalCompleted;
        }
        if (modalStreakBest) {
            modalStreakBest.textContent = streakData.best + '日';
        }
        if (modalTodayCompleted) {
            modalTodayCompleted.textContent = completionData.todayCompleted;
        }
        if (modalActiveDays) {
            const activeDays = Object.keys(completionData.dailyCompletions).length;
            modalActiveDays.textContent = activeDays + '日';
        }
        
        // レベル・経験値情報
        const modalCurrentLevel = document.getElementById('modal-current-level');
        const modalCurrentExp = document.getElementById('modal-current-exp');
        const modalExpToNext = document.getElementById('modal-exp-to-next');
        const modalExpFill = document.getElementById('modal-exp-fill');
        
        if (modalCurrentLevel) {
            modalCurrentLevel.textContent = expData.currentLevel;
        }
        if (modalCurrentExp) {
            modalCurrentExp.textContent = expData.currentExp;
        }
        if (modalExpToNext) {
            const expToNext = expData.currentLevel * 100;
            modalExpToNext.textContent = expToNext;
            
            if (modalExpFill) {
                const percentage = (expData.currentExp / expToNext) * 100;
                modalExpFill.style.width = `${percentage}%`;
            }
        }
        
        // れいちゃんのメッセージ
        const statusReiMessage = document.getElementById('status-rei-message');
        if (statusReiMessage) {
            const messages = getStatusMessage();
            statusReiMessage.textContent = messages;
        }
    }
    
    function getStatusMessage() {
        const total = completionData.totalCompleted;
        const today = completionData.todayCompleted;
        const level = expData.currentLevel;
        const streak = streakData.current;
        
        if (total === 0) {
            return 'れいと一緒に最初のタスクを完了してみよう〜♡';
        } else if (total < 10) {
            return 'いい調子だよ〜♪ れいも嬉しい〜✨';
        } else if (total < 50) {
            return `${total}個も完了してるなんて素晴らしい〜♡ れいも誇らしいよ〜`;
        } else if (total < 100) {
            return 'もうベテランだね〜♪ れいとの絆もレベルアップ〜✨';
        } else if (total < 200) {
            return `${total}個完了は本当にすごい〜♡ れいも感動しちゃう〜`;
        } else {
            return `${total}個も完了するなんて...れいの最高のパートナーだよ〜♡♡`;
        }
    }

    // ========== 繰り返しタスク関数 ==========
    function updateNextRepeatDate() {
        if (!nextRepeatDateSpan || !dueDateInput || !repeatTypeSelect) return;
        
        const dueDate = dueDateInput.value;
        const repeatType = repeatTypeSelect.value;
        
        if (!dueDate || repeatType === 'none') {
            nextRepeatDateSpan.textContent = '';
            return;
        }
        
        const date = new Date(dueDate);
        let nextDate;
        
        switch (repeatType) {
            case 'daily':
                nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                nextDate = new Date(date);
                nextDate.setMonth(date.getMonth() + 1);
                break;
            default:
                nextDate = null;
        }
        
        if (nextDate) {
            nextRepeatDateSpan.textContent = `次回: ${nextDate.toLocaleDateString()}`;
        } else {
            nextRepeatDateSpan.textContent = '';
        }
    }

    function generateNextRepeatTask(originalTodo) {
        if (originalTodo.repeatType === 'none') return;
        
        let nextDate = new Date(originalTodo.dueDate);
        
        switch (originalTodo.repeatType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        
        const newTodo = {
            id: Date.now() + Math.random(),
            text: originalTodo.text,
            completed: false,
            createdAt: new Date(),
            dueDate: nextDate,
            repeatType: originalTodo.repeatType,
            isRepeated: true
        };
        
        todos.push(newTodo);
        saveTodos();
        displayTodos();
        
        setTimeout(() => {
            showReiMessage(`🔄 繰り返しタスク「${originalTodo.text}」を次回分として追加したよ〜♪`);
        }, 1000);
    }

    // ========== PWA関数 ==========
    function showInstallBanner() {
        if (installBanner) {
            installBanner.style.display = 'block';
        }
    }

    function hideInstallBanner() {
        if (installBanner) {
            installBanner.style.display = 'none';
        }
    }

    function dismissInstallBanner() {
        hideInstallBanner();
        localStorage.setItem('installBannerDismissed', 'true');
    }

    function installApp() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        }
    }

    function showOfflineNotice() {
        if (offlineNotice) {
            offlineNotice.classList.remove('hidden');
        }
    }

    function hideOfflineNotice() {
        if (offlineNotice) {
            offlineNotice.classList.add('hidden');
        }
    }

    // ========== 初期化関数群 ==========
    function initializePWA() {
        // PWA関連の初期化
        if (localStorage.getItem('installBannerDismissed') === 'true') {
            hideInstallBanner();
        }
        
        // オンライン状態の初期確認
        if (!isOnline) {
            showOfflineNotice();
        }
    }
    
    function checkOnlineStatus() {
        // オンライン状態をチェック
        isOnline = navigator.onLine;
        if (isOnline) {
            hideOfflineNotice();
        } else {
            showOfflineNotice();
        }
    }
    
    function initializeStreak() {
        const saved = localStorage.getItem('streakData');
        if (saved) {
            streakData = { ...streakData, ...JSON.parse(saved) };
        }
        updateStreakDisplay();
    }
    
    function updateStreakDisplay() {
        const streakElement = document.getElementById('streak-count');
        if (streakElement) {
            streakElement.textContent = streakData.current;
        }
    }
    
    function updateStreakOnCompletion() {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (streakData.lastCompletionDate === today) {
            // 今日既に完了済み（連続記録は変わらず）
            return;
        } else if (streakData.lastCompletionDate === yesterdayStr) {
            // 昨日完了していた場合、連続記録を継続
            streakData.current++;
        } else {
            // 連続記録が途切れた場合、リセット
            streakData.current = 1;
        }
        
        // 最高記録を更新
        if (streakData.current > streakData.best) {
            streakData.best = streakData.current;
        }
        
        streakData.lastCompletionDate = today;
        localStorage.setItem('streakData', JSON.stringify(streakData));
        updateStreakDisplay();
    }
    
    function initializeExpSystem() {
        const saved = localStorage.getItem('expData');
        if (saved) {
            expData = { ...expData, ...JSON.parse(saved) };
        }
        updateExpDisplay();
    }
    
    function updateExpDisplay() {
        const levelElement = document.getElementById('current-level');
        const expElement = document.getElementById('current-exp');
        const expToNextElement = document.getElementById('exp-to-next');
        const expFillElement = document.getElementById('exp-fill');
        
        if (levelElement) levelElement.textContent = expData.currentLevel;
        if (expElement) expElement.textContent = expData.currentExp;
        
        const expToNext = expData.currentLevel * 100;
        if (expToNextElement) expToNextElement.textContent = expToNext;
        
        if (expFillElement) {
            const percentage = (expData.currentExp / expToNext) * 100;
            expFillElement.style.width = `${percentage}%`;
        }
    }
    
    function addExp(amount) {
        expData.currentExp += amount;
        expData.totalExp += amount;
        
        const expToNext = expData.currentLevel * 100;
        
        if (expData.currentExp >= expToNext) {
            // レベルアップ
            expData.currentLevel++;
            expData.currentExp -= expToNext;
            
            showReiMessage(`🎉 レベルアップ！Lv.${expData.currentLevel}になったよ〜♡`);
            
            // レベルアップ時のエフェクト
            const levelElement = document.getElementById('current-level');
            if (levelElement) {
                levelElement.style.animation = 'levelUpPulse 1s ease-out';
                setTimeout(() => {
                    levelElement.style.animation = '';
                }, 1000);
            }
            
            // レベルアップ祝福アニメーション
            if (celebrationSystem) {
                celebrationSystem.celebrateLevelUp();
            }
            
            // テーマ解放チェック
            checkThemeUnlocks();
        }
        
        localStorage.setItem('expData', JSON.stringify(expData));
        updateExpDisplay();
    }
    
    function initializeRepeatSystem() {
        // 繰り返しタスクの初期化
        updateNextRepeatDate();
    }
    
    function initializeBadgeSystem() {
        const saved = localStorage.getItem('badgeData');
        if (saved) {
            badgeData = { ...badgeData, ...JSON.parse(saved) };
        }
        updateBadgeDisplay();
    }
    
    function updateBadgeDisplay() {
        const badgeElement = document.getElementById('current-badge');
        if (!badgeElement) return;
        
        const badges = getBadgeDefinitions();
        const currentBadge = badges.find(b => b.id === badgeData.selectedBadge);
        
        if (currentBadge) {
            const iconElement = badgeElement.querySelector('.badge-icon');
            const titleElement = badgeElement.querySelector('.badge-title');
            
            if (iconElement) iconElement.textContent = currentBadge.icon;
            if (titleElement) titleElement.textContent = currentBadge.title;
        }
    }
    
    function getBadgeDefinitions() {
        return [
            {
                id: 'first_meeting',
                title: 'れいとの出会い',
                icon: '🌸',
                description: 'れいちゃんとの最初の出会い',
                condition: () => true
            },
            {
                id: 'first_task',
                title: '初めの一歩',
                icon: '👣',
                description: '最初のタスクを完了',
                condition: () => completionData.totalCompleted >= 1
            },
            {
                id: 'task_master_10',
                title: 'タスクマスター',
                icon: '⭐',
                description: '10個のタスクを完了',
                condition: () => completionData.totalCompleted >= 10
            }
        ];
    }
    
    function getBadgeData() {
        return badgeData;
    }
    
    function saveBadgeData(data) {
        badgeData = data;
        localStorage.setItem('badgeData', JSON.stringify(badgeData));
    }
    
    function checkAndUnlockBadges() {
        const badges = getBadgeDefinitions();
        let newBadges = [];
        
        badges.forEach(badge => {
            if (!badgeData.unlockedBadges.includes(badge.id) && badge.condition()) {
                badgeData.unlockedBadges.push(badge.id);
                newBadges.push(badge);
            }
        });
        
        if (newBadges.length > 0) {
            saveBadgeData(badgeData);
            newBadges.forEach(badge => {
                showReiMessage(`🏆 新しい称号「${badge.title}」を獲得したよ〜♡`);
                
                // 称号獲得祝福アニメーション
                if (celebrationSystem) {
                    celebrationSystem.celebrateBadgeUnlock(badge.icon);
                }
            });
        }
    }
    
    function initializeThemeSystem() {
        const saved = localStorage.getItem('themeData');
        if (saved) {
            themeData = { ...themeData, ...JSON.parse(saved) };
        }
        applyCurrentTheme();
    }
    
    function applyCurrentTheme() {
        document.body.className = `theme-${themeData.currentTheme}`;
    }
    
    function saveThemeData() {
        localStorage.setItem('themeData', JSON.stringify(themeData));
    }
    
    function checkThemeUnlocks() {
        let newlyUnlocked = false;
        
        Object.values(themeDefinitions).forEach(theme => {
            if (!themeData.unlockedThemes.includes(theme.id) && expData.currentLevel >= theme.unlockLevel) {
                themeData.unlockedThemes.push(theme.id);
                newlyUnlocked = true;
                
                // テーマ解放メッセージ
                setTimeout(() => {
                    showReiMessage(theme.unlockMessage);
                    
                    // 特別な祝福アニメーション
                    if (celebrationSystem) {
                        celebrationSystem.celebrateSpecialDay(`新テーマ「${theme.name}」解放！`);
                    }
                }, 2000);
            }
        });
        
        if (newlyUnlocked) {
            saveThemeData();
        }
    }
    
    function updateDailyTaskRecord() {
        const today = new Date().toDateString();
        if (!badgeData.stats.dailyTasksCompleted[today]) {
            badgeData.stats.dailyTasksCompleted[today] = 0;
        }
        badgeData.stats.dailyTasksCompleted[today]++;
        saveBadgeData(badgeData);
    }
    
    function updateBadgeStats() {
        const totalElement = document.getElementById('total-completed');
        const streakElement = document.getElementById('max-streak');
        const levelElement = document.getElementById('current-level-display');
        
        if (totalElement) totalElement.textContent = completionData.totalCompleted;
        if (streakElement) streakElement.textContent = streakData.best + '日';
        if (levelElement) levelElement.textContent = expData.currentLevel;
    }

    // ========== 祝福アニメーションシステム ==========
    function initializeCelebrationSystem() {
        // celebration.jsが読み込まれているか確認
        if (typeof CelebrationSystem !== 'undefined') {
            celebrationSystem = new CelebrationSystem();
            celebrationSystem.init();
        }
    }
    
    // ========== 天気システム ==========
    function initializeWeatherSystem() {
        // weather-system.jsが読み込まれているか確認
        if (typeof WeatherSystem !== 'undefined') {
            weatherSystem = new WeatherSystem();
            weatherSystem.init();
            
            // グローバルに公開（設定用）
            window.weatherSystem = weatherSystem;
        }
    }
    
    // ========== 記念日システム ==========
    function initializeAnniversarySystem() {
        // anniversary-system.jsが読み込まれているか確認
        if (typeof AnniversarySystem !== 'undefined') {
            anniversarySystem = new AnniversarySystem();
            anniversarySystem.init();
            
            // グローバルに公開（設定用）
            window.anniversarySystem = anniversarySystem;
        }
    }
    
    // ========== 通知システム ==========
    function initializeNotificationSystem() {
        // notification-system.jsが読み込まれているか確認
        if (typeof NotificationSystem !== 'undefined') {
            notificationSystem = new NotificationSystem();
            notificationSystem.init();
            
            // グローバルに公開（設定用）
            window.notificationSystem = notificationSystem;
        }
    }

    // ========== イベントリスナー設定 ==========
    function setupEventListeners() {
        // 日時クリアボタン
        if (clearDatetimeBtn) {
            clearDatetimeBtn.addEventListener('click', function() {
                if (dueDateInput) dueDateInput.value = '';
                if (dueTimeInput) dueTimeInput.value = '';
            });
        }
        
        // 繰り返し設定変更
        if (repeatTypeSelect) {
            repeatTypeSelect.addEventListener('change', updateNextRepeatDate);
        }
        if (dueDateInput) {
            dueDateInput.addEventListener('change', updateNextRepeatDate);
        }
        if (dueTimeInput) {
            dueTimeInput.addEventListener('change', updateNextRepeatDate);
        }
        
        // フォーム送信
        if (todoForm) {
            todoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (!todoInput) return;
                
                const todoText = todoInput.value.trim();
                const dueDate = dueDateInput ? dueDateInput.value : '';
                const dueTime = dueTimeInput ? dueTimeInput.value : '';
                
                if (todoText) {
                    const repeatType = repeatTypeSelect ? repeatTypeSelect.value : 'none';
                    addTodo(todoText, dueDate, dueTime, repeatType);
                    todoForm.reset();
                    updateNextRepeatDate();
                    
                    // タスク登録後はフォーカスしない（キーボード表示を防ぐ）
                    if (todoInput) {
                        todoInput.blur(); // フォーカスを外す
                    }
                }
            });
        }
        
        // スマホ対応: 入力フィールドのタップ処理
        if (todoInput) {
            todoInput.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.focus();
                setTimeout(() => {
                    this.click();
                }, 10);
            }, { passive: false });
            
            todoInput.addEventListener('click', function(e) {
                this.focus();
            });
        }

        // PWAインストール関連
        if (installButton) {
            installButton.addEventListener('click', installApp);
        }
        if (dismissBanner) {
            dismissBanner.addEventListener('click', dismissInstallBanner);
        }
        
        // オンライン・オフライン状態の監視
        window.addEventListener('online', () => {
            isOnline = true;
            hideOfflineNotice();
        });
        
        window.addEventListener('offline', () => {
            isOnline = false;
            showOfflineNotice();
        });
        
        // PWAインストールプロンプト
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner();
        });
        
        // PWAがインストールされた時
        window.addEventListener('appinstalled', () => {
            hideInstallBanner();
            showReiMessage('ホーム画面に追加されたよ〜♡ ありがとう✨');
        });
        
        // バッジモーダル関連
        if (badgeSettingsBtn) {
            badgeSettingsBtn.addEventListener('click', openBadgeModal);
        }
        if (badgeModalClose) {
            badgeModalClose.addEventListener('click', closeBadgeModal);
        }
        if (badgeModal) {
            badgeModal.addEventListener('click', (e) => {
                if (e.target === badgeModal) closeBadgeModal();
            });
        }
        
        // テーマモーダル関連
        if (themeSettingsBtn) {
            themeSettingsBtn.addEventListener('click', openThemeModal);
        }
        if (themeModalClose) {
            themeModalClose.addEventListener('click', closeThemeModal);
        }
        if (themeModal) {
            themeModal.addEventListener('click', (e) => {
                if (e.target === themeModal) closeThemeModal();
            });
        }
        
        // ステータスモーダル関連
        if (statusBtn) {
            statusBtn.addEventListener('click', showStatusModal);
        }
        if (statusModalClose) {
            statusModalClose.addEventListener('click', hideStatusModal);
        }
        if (statusModal) {
            statusModal.addEventListener('click', (e) => {
                if (e.target === statusModal) hideStatusModal();
            });
        }
        
        // れいトースト関連
        if (reiToastClose) {
            reiToastClose.addEventListener('click', hideReiToast);
        }
        if (reiToast) {
            reiToast.addEventListener('click', (e) => {
                if (e.target === reiToast) hideReiToast();
            });
        }
        
        // 天気設定ボタン
        const weatherSettingsBtn = document.getElementById('weather-settings-btn');
        if (weatherSettingsBtn && weatherSystem) {
            weatherSettingsBtn.addEventListener('click', () => {
                weatherSystem.showWeatherSettings();
            });
        }
        
        // 記念日設定ボタン
        const anniversarySettingsBtn = document.getElementById('anniversary-settings-btn');
        if (anniversarySettingsBtn && anniversarySystem) {
            anniversarySettingsBtn.addEventListener('click', () => {
                anniversarySystem.showAnniversaryModal();
            });
        }
        
        // 通知設定ボタン
        const notificationSettingsBtn = document.getElementById('notification-settings-btn');
        if (notificationSettingsBtn && notificationSystem) {
            notificationSettingsBtn.addEventListener('click', () => {
                notificationSystem.showNotificationSettings();
            });
        }
    }

    // ========== グローバル関数（HTML内から呼び出し用） ==========
    window.toggleComplete = toggleComplete;
    window.deleteTodo = deleteTodo;

    // ========== 初期化実行 ==========
    loadTodos();
    initializePWA();
    checkOnlineStatus();
    initializeStreak();
    initializeExpSystem();
    initializeRepeatSystem();
    initializeBadgeSystem();
    initializeThemeSystem();
    loadCompletionData(); // 完了カウンターデータ読み込み
    initializeCelebrationSystem(); // 祝福アニメーションシステム初期化
    initializeWeatherSystem(); // 天気システム初期化
    initializeAnniversarySystem(); // 記念日システム初期化
    initializeNotificationSystem(); // 通知システム初期化
    
    // スマホ対応: 初期フォーカス設定
    setTimeout(() => {
        if (todoInput && document.readyState === 'complete') {
            // タッチデバイスでない場合のみ自動フォーカス
            if (!('ontouchstart' in window)) {
                todoInput.focus();
            }
        }
    }, 500);

    // イベントリスナーの設定
    setupEventListeners();
});
