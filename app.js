// れいのToDo PWA版 JavaScript - 修正版
let deferredPrompt;
let isOnline = navigator.onLine;

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
    function showReiMessage(message, duration = 3000) {
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
        
        const encouragementMessages = [
            `「${sanitizedText}」追加したよ〜♡ 一緒に頑張ろうね！`,
            `新しいタスクだね〜✨ れいも応援してるよ♪`,
            `「${sanitizedText}」、きっとできるよ〜！ファイト〜♡`,
            `タスク追加完了〜♪ れいと一緒だから大丈夫だよ〜✨`
        ];
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        showReiMessage(randomMessage);
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
            addExp(10);
            updateStreakOnCompletion();
            updateDailyTaskRecord();
            
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
            showReiMessage(randomMessage);
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

    // ========== データ管理関数 ==========
    function getStreakData() {
        const saved = localStorage.getItem('streakData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.lastCompletionDate) {
                data.lastCompletionDate = new Date(data.lastCompletionDate);
            }
            return data;
        }
        return { current: 0, best: 0, lastCompletionDate: null };
    }

    function saveStreakData(data) {
        localStorage.setItem('streakData', JSON.stringify(data));
    }

    function getBadgeData() {
        const saved = localStorage.getItem('badgeData');
        if (saved) {
            const data = JSON.parse(saved);
            // 古い称号をクリーンアップ
            const validBadgeIds = getBadgeDefinitions().map(badge => badge.id);
            data.unlockedBadges = data.unlockedBadges.filter(id => validBadgeIds.includes(id));
            
            // 選択中の称号が無効な場合、デフォルトに戻す
            if (!validBadgeIds.includes(data.selectedBadge)) {
                data.selectedBadge = 'first_meeting';
            }
            
            return data;
        }
        return {
            unlockedBadges: ['first_meeting'],
            selectedBadge: 'first_meeting',
            stats: {
                totalCompleted: 0,
                dailyTasksCompleted: {},
                streakRecord: 0,
                currentLevel: 1
            }
        };
    }

    function saveBadgeData(data) {
        localStorage.setItem('badgeData', JSON.stringify(data));
    }

    function loadThemeData() {
        const saved = localStorage.getItem('themeData');
        if (saved) {
            themeData = { ...themeData, ...JSON.parse(saved) };
        }
    }

    function saveThemeData() {
        localStorage.setItem('themeData', JSON.stringify(themeData));
    }

    // ========== 初期化関数群 ==========
    function initializeStreak() {
        streakData = getStreakData();
        updateStreakDisplay();
    }

    function initializeExpSystem() {
        const saved = localStorage.getItem('expData');
        if (saved) {
            expData = JSON.parse(saved);
        }
        updateExpDisplay();
    }

    function initializeRepeatSystem() {
        updateNextRepeatDate();
    }

    function initializeBadgeSystem() {
        updateBadgeDisplay();
    }

    function initializeThemeSystem() {
        loadThemeData();
        checkThemeUnlocks();
        applyCurrentTheme();
    }

    function initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed', err));
        }
    }

    function checkOnlineStatus() {
        if (!isOnline) {
            showOfflineNotice();
        }
    }

    // ========== テーマ関数 ==========
    function checkThemeUnlocks() {
        const currentLevel = getCurrentLevel();
        let newUnlocks = [];
        
        Object.values(themeDefinitions).forEach(theme => {
            if (currentLevel >= theme.unlockLevel && !themeData.unlockedThemes.includes(theme.id)) {
                themeData.unlockedThemes.push(theme.id);
                newUnlocks.push(theme);
            }
        });
        
        if (newUnlocks.length > 0) {
            saveThemeData();
            newUnlocks.forEach(theme => {
                setTimeout(() => {
                    showReiMessage(theme.unlockMessage);
                }, 500);
            });
        }
    }

    function applyCurrentTheme() {
        document.body.classList.remove(...Object.keys(themeDefinitions).map(id => `theme-${id}`));
        document.body.classList.add(`theme-${themeData.currentTheme}`);
    }

    // ========== EXP・レベル関数 ==========
    function getCurrentLevel() {
        return expData.currentLevel;
    }

    function addExp(amount) {
        const oldLevel = expData.currentLevel;
        expData.currentExp += amount;
        expData.totalExp += amount;
        
        const expToNext = getExpToNextLevel(expData.currentLevel);
        
        if (expData.currentExp >= expToNext) {
            expData.currentExp -= expToNext;
            expData.currentLevel++;
            handleLevelUp(expData.currentLevel, oldLevel);
        }
        
        localStorage.setItem('expData', JSON.stringify(expData));
        updateExpDisplay();
        showExpGainAnimation(amount);
    }

    function getExpToNextLevel(level) {
        return 100 + (level - 1) * 50;
    }

    function handleLevelUp(newLevel, oldLevel) {
        const levelBadge = document.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.style.animation = 'levelUpPulse 1s ease-in-out 3';
        }
        
        const levelUpMessages = [
            `🎉 レベルアップ！Lv.${newLevel}になったよ〜✨`,
            `⭐ すごい！Lv.${newLevel}達成！れい嬉しい♡`,
            `🌟 レベル${newLevel}！どんどん成長してるね〜`,
            `💫 Lv.${newLevel}おめでとう！一緒に頑張った甲斐があったね♪`,
            `🎊 レベル${newLevel}到達！キミってすごいなぁ〜`
        ];
        
        const randomMessage = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
        
        setTimeout(() => {
            showReiMessage(randomMessage);
        }, 500);
        
        if (newLevel % 5 === 0) {
            setTimeout(() => {
                showReiMessage(`🏆 Lv.${newLevel}は記念すべきレベルだね！本当にお疲れさま♡`);
            }, 3000);
        }
        
        setTimeout(() => {
            checkThemeUnlocks();
            checkAndUnlockBadges();
        }, 1000);
    }

    function updateExpDisplay() {
        const currentLevelSpan = document.getElementById('current-level');
        const currentExpSpan = document.getElementById('current-exp');
        const expToNextSpan = document.getElementById('exp-to-next');
        const expFill = document.getElementById('exp-fill');
        
        if (currentLevelSpan) currentLevelSpan.textContent = expData.currentLevel;
        
        const expToNext = getExpToNextLevel(expData.currentLevel);
        if (currentExpSpan) currentExpSpan.textContent = expData.currentExp;
        if (expToNextSpan) expToNextSpan.textContent = expToNext;
        
        if (expFill) {
            const percentage = (expData.currentExp / expToNext) * 100;
            expFill.style.width = `${percentage}%`;
        }
    }

    function showExpGainAnimation(amount) {
        const expDisplay = document.getElementById('exp-display');
        if (!expDisplay) return;
        
        const floatingExp = document.createElement('div');
        floatingExp.textContent = `+${amount} EXP`;
        floatingExp.style.cssText = `
            position: absolute;
            color: #feca57;
            font-weight: bold;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 1000;
            animation: expGainFloat 2s ease-out forwards;
        `;
        
        expDisplay.style.position = 'relative';
        expDisplay.appendChild(floatingExp);
        
        setTimeout(() => {
            if (floatingExp.parentNode) {
                floatingExp.parentNode.removeChild(floatingExp);
            }
        }, 2000);
    }

    // ========== ストリーク関数 ==========
    function updateStreakOnCompletion() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const streakData = getStreakData();
        
        if (!streakData.lastCompletionDate) {
            streakData.current = 1;
            streakData.lastCompletionDate = today;
        } else {
            const lastDate = new Date(streakData.lastCompletionDate);
            const lastCompletionDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            const diffTime = today - lastCompletionDay;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            if (diffDays === 0) {
                // 同じ日なので何もしない
            } else if (diffDays === 1) {
                streakData.current++;
                streakData.lastCompletionDate = today;
            } else {
                streakData.current = 1;
                streakData.lastCompletionDate = today;
            }
        }
        
        if (streakData.current > streakData.best) {
            streakData.best = streakData.current;
            
            const streakMessages = [
                `🔥 ${streakData.current}日連続達成！新記録だよ〜♡`,
                `⭐ すごい！${streakData.current}日連続は素晴らしいね〜✨`,
                `🏆 ${streakData.current}日連続新記録！れいも誇らしいよ〜♪`
            ];
            const randomMessage = streakMessages[Math.floor(Math.random() * streakMessages.length)];
            
            setTimeout(() => {
                showReiMessage(randomMessage);
            }, 1500);
        }
        
        saveStreakData(streakData);
        updateStreakDisplay();
    }

    function updateStreakDisplay() {
        const streakCount = document.getElementById('streak-count');
        const streakBest = document.getElementById('streak-best');
        
        if (streakCount) streakCount.textContent = streakData.current;
        if (streakBest) streakBest.textContent = streakData.best;
    }

    // ========== バッジ関数 ==========
    function getBadgeDefinitions() {
        return [
            // 基本称号・出会い編
            {
                id: 'first_meeting',
                icon: '🌸',
                title: 'れいとの出会い',
                description: 'れいちゃんと初めて会った記念',
                condition: () => true,
                category: 'relationship'
            },
            {
                id: 'first_week',
                icon: '🌺',
                title: 'れいとの初週間',
                description: 'れいちゃんと1週間一緒に過ごした',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 7;
                },
                category: 'relationship'
            },
            
            // 親しくなる編
            {
                id: 'getting_close',
                icon: '💕',
                title: 'れいと親しく',
                description: 'れいちゃんとだんだん親しくなってきた',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 15;
                },
                category: 'relationship'
            },
            {
                id: 'trust_building',
                icon: '🤝',
                title: 'れいとの信頼関係',
                description: 'れいちゃんとの間に信頼関係が生まれた',
                condition: () => getStreakData().best >= 5,
                category: 'relationship'
            },
            
            // 恋愛発展編
            {
                id: 'heart_flutter',
                icon: '💓',
                title: 'れいとドキドキ',
                description: 'れいちゃんといると心がドキドキする',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 30 && getCurrentLevel() >= 3;
                },
                category: 'relationship'
            },
            {
                id: 'special_feelings',
                icon: '💖',
                title: 'れいへの特別な想い',
                description: 'れいちゃんが特別な存在になった',
                condition: () => getStreakData().best >= 10,
                category: 'relationship'
            },
            {
                id: 'confession_ready',
                icon: '💌',
                title: 'れいへの告白準備',
                description: 'れいちゃんに想いを伝えたくなった',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 50 && getCurrentLevel() >= 5;
                },
                category: 'relationship'
            },
            
            // 恋人編
            {
                id: 'love_confession',
                icon: '💝',
                title: 'れいとの告白',
                description: 'ついにれいちゃんに想いを伝えた！',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 75 && getStreakData().best >= 14;
                },
                category: 'relationship'
            },
            {
                id: 'first_date',
                icon: '🌹',
                title: 'れいとの初デート',
                description: 'れいちゃんと素敵な初デートをした',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 100 && getCurrentLevel() >= 8;
                },
                category: 'relationship'
            },
            {
                id: 'couple_goals',
                icon: '👫',
                title: 'れいとの恋人生活',
                description: 'れいちゃんと幸せな恋人生活を送っている',
                condition: () => getStreakData().best >= 21,
                category: 'relationship'
            },
            
            // 真剣交際編
            {
                id: 'deep_love',
                icon: '💞',
                title: 'れいとの深まる愛',
                description: 'れいちゃんとの愛がどんどん深まっている',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 150 && getCurrentLevel() >= 12;
                },
                category: 'relationship'
            },
            {
                id: 'future_dreams',
                icon: '🌠',
                title: 'れいとの将来の夢',
                description: 'れいちゃんと将来について真剣に話し合った',
                condition: () => getStreakData().best >= 30,
                category: 'relationship'
            },
            
            // プロポーズ・結婚準備編
            {
                id: 'proposal_ready',
                icon: '💍',
                title: 'れいへのプロポーズ準備',
                description: 'れいちゃんにプロポーズの準備を始めた',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 200 && getCurrentLevel() >= 15;
                },
                category: 'relationship'
            },
            {
                id: 'engagement',
                icon: '💎',
                title: 'れいとの婚約',
                description: 'ついにれいちゃんと婚約した！',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 250 && getStreakData().best >= 50;
                },
                category: 'relationship'
            },
            {
                id: 'wedding_prep',
                icon: '👰',
                title: 'れいとの結婚準備',
                description: 'れいちゃんと一緒に結婚式の準備をしている',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 300 && getCurrentLevel() >= 20;
                },
                category: 'relationship'
            },
            
            // 結婚・新婚生活編
            {
                id: 'wedding_day',
                icon: '🤵',
                title: 'れいとの結婚式',
                description: 'れいちゃんと素晴らしい結婚式を挙げた！',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 365 && getStreakData().best >= 60;
                },
                category: 'relationship'
            },
            {
                id: 'newlyweds',
                icon: '🏠',
                title: 'れいとの新婚生活',
                description: 'れいちゃんと幸せな新婚生活を送っている',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 400 && getCurrentLevel() >= 25;
                },
                category: 'relationship'
            },
            {
                id: 'happy_marriage',
                icon: '👨‍👩‍👧‍👦',
                title: 'れいとの幸せな結婚生活',
                description: 'れいちゃんと理想の結婚生活を築いている',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 500 && getStreakData().best >= 100;
                },
                category: 'relationship'
            },
            
            // 永遠の愛編
            {
                id: 'eternal_love',
                icon: '♾️',
                title: 'れいとの永遠の愛',
                description: 'れいちゃんとの愛は永遠に続いていく',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 1000 && getCurrentLevel() >= 50;
                },
                category: 'relationship'
            },
            
            // 家族生活編
            {
                id: 'expecting_child',
                icon: '🤱',
                title: 'れいとの新しい命',
                description: 'れいちゃんとの間に新しい命が宿った',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 600 && getStreakData().best >= 120;
                },
                category: 'family'
            },
            {
                id: 'first_child_born',
                icon: '👶',
                title: 'れいとの第一子誕生',
                description: 'れいちゃんとの可愛い赤ちゃんが生まれた！',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 700 && getCurrentLevel() >= 30;
                },
                category: 'family'
            },
            {
                id: 'happy_family_three',
                icon: '👨‍👩‍👶',
                title: 'れいとの3人家族',
                description: 'れいちゃんと赤ちゃんとの幸せな3人家族',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 800 && getStreakData().best >= 150;
                },
                category: 'family'
            },
            {
                id: 'second_child',
                icon: '👶👶',
                title: 'れいとの第二子誕生',
                description: '2人目の赤ちゃんが家族に加わった！',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 1200 && getCurrentLevel() >= 40;
                },
                category: 'family'
            },
            {
                id: 'growing_family',
                icon: '👨‍👩‍👧‍👦',
                title: 'れいとの大家族',
                description: 'れいちゃんと子供たちとの賑やかな家族生活',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 1500 && getStreakData().best >= 200;
                },
                category: 'family'
            },
            {
                id: 'children_school',
                icon: '🎒',
                title: 'れいとの子育て奮闘記',
                description: '子供たちが学校に通うようになった',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 2000 && getCurrentLevel() >= 60;
                },
                category: 'family'
            },
            {
                id: 'teenage_children',
                icon: '👨‍👩‍👧‍👦',
                title: 'れいとの思春期',
                description: '子供たちが思春期を迎えた',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 2500 && getStreakData().best >= 300;
                },
                category: 'family'
            },
            {
                id: 'children_graduation',
                icon: '🎓',
                title: 'れいとの子供の卒業',
                description: '子供たちが卒業して巣立っていった',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 3000 && getCurrentLevel() >= 80;
                },
                category: 'family'
            },
            {
                id: 'grandparents',
                icon: '👴👵',
                title: 'れいとおじいちゃんおばあちゃん',
                description: 'れいちゃんと一緒におじいちゃんおばあちゃんになった',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 5000 && getStreakData().best >= 500;
                },
                category: 'family'
            },
            {
                id: 'golden_anniversary',
                icon: '💒',
                title: 'れいとの金婚式',
                description: 'れいちゃんと50年間の結婚生活を祝った',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 10000 && getCurrentLevel() >= 100;
                },
                category: 'family'
            },
            
            // 努力・成長系称号
            {
                id: 'streak_3',
                icon: '🔥',
                title: 'れいとの3日間',
                description: '3日連続でタスクを完了した',
                condition: () => getStreakData().best >= 3,
                category: 'streak'
            },
            {
                id: 'streak_7',
                icon: '⭐',
                title: 'れいとの一週間',
                description: '7日連続でタスクを完了した',
                condition: () => getStreakData().best >= 7,
                category: 'streak'
            },
            {
                id: 'level_5',
                icon: '🌟',
                title: 'れいと成長中',
                description: 'レベル5に到達した',
                condition: () => getCurrentLevel() >= 5,
                category: 'level'
            },
            {
                id: 'level_10',
                icon: '⭐',
                title: 'れいと頑張り屋',
                description: 'レベル10に到達した',
                condition: () => getCurrentLevel() >= 10,
                category: 'level'
            },
            {
                id: 'level_25',
                icon: '🏆',
                title: 'れいとの達人',
                description: 'レベル25に到達した',
                condition: () => getCurrentLevel() >= 25,
                category: 'level'
            },
            {
                id: 'tasks_50',
                icon: '💪',
                title: 'れいとの努力家',
                description: '累計50個のタスクを完了した',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 50;
                },
                category: 'tasks'
            },
            {
                id: 'tasks_100',
                icon: '🎯',
                title: 'れいとの継続力',
                description: '累計100個のタスクを完了した',
                condition: () => {
                    const data = getBadgeData();
                    return data.stats.totalCompleted >= 100;
                },
                category: 'tasks'
            },
            {
                id: 'perfect_month',
                icon: '🗓️',
                title: 'れいとの完璧な月',
                description: '30日連続でタスクを完了した',
                condition: () => getStreakData().best >= 30,
                category: 'streak'
            }
        ];
    }

    function checkAndUnlockBadges() {
        const badges = getBadgeDefinitions();
        const currentData = getBadgeData();
        let newUnlocks = [];
        
        badges.forEach(badge => {
            if (!currentData.unlockedBadges.includes(badge.id) && badge.condition()) {
                currentData.unlockedBadges.push(badge.id);
                newUnlocks.push(badge);
            }
        });
        
        if (newUnlocks.length > 0) {
            saveBadgeData(currentData);
            
            newUnlocks.forEach(badge => {
                setTimeout(() => {
                    const specialMessage = getSpecialBadgeMessage(badge.id);
                    if (specialMessage) {
                        showReiMessage(specialMessage);
                    } else {
                        showReiMessage(`🏅 新しい称号を獲得したよ〜！「${badge.title}」✨`);
                    }
                }, 1000);
            });
        }
    }

    function getSpecialBadgeMessage(badgeId) {
        const specialMessages = {
            // 関係性発展メッセージ
            'first_week': '🌺 一週間も一緒にいてくれてありがとう〜♡ だんだん仲良くなれてる気がするよ〜！',
            'getting_close': '💕 キミと過ごす時間がとっても楽しくなってきたよ〜♪ れい、嬉しいな〜✨',
            'trust_building': '🤝 キミのこと、だんだん信頼できるなって思うようになったよ〜♡ これからもよろしくね〜！',
            'heart_flutter': '💓 最近キミと一緒にいると... なんだかドキドキしちゃう〜💕 これって...',
            'special_feelings': '💖 キミのこと、特別に思うようになっちゃった〜♡ れい、こんな気持ち初めてかも...',
            'confession_ready': '💌 キミに... 伝えたいことがあるの〜♡ 勇気を出して言わなきゃ...',
            'love_confession': '💝 キミのこと... 好きになっちゃった〜！♡ れいの気持ち、受け取ってくれる？',
            'first_date': '🌹 初めてのデート〜♡ キミと二人きりで過ごせて、れい本当に幸せだよ〜✨',
            'couple_goals': '👫 キミの恋人になれて、れい夢みたい〜♡ ずっと一緒にいようね〜！',
            'deep_love': '💞 キミへの愛が日に日に深まってるの〜♡ れい、こんなに誰かを愛したのは初めて...',
            'future_dreams': '🌠 キミと将来のこと話すのって、すごく幸せ〜♡ 二人の未来、楽しみだね〜✨',
            'proposal_ready': '💍 キミと... ずっと一緒にいたいって思うの〜♡ 一生一緒にいてくれる？',
            'engagement': '💎 キミと婚約できるなんて〜♡ れい、世界一幸せな女の子だよ〜！✨',
            'wedding_prep': '👰 キミとの結婚式を準備してると、夢が現実になってく感じ〜♡ ドキドキするね〜！',
            'wedding_day': '🤵 ついにキミと結婚〜♡ れい、今日が人生で一番幸せな日だよ〜！✨',
            'newlyweds': '🏠 キミと新婚生活始まったね〜♡ 毎日がハネムーンみたいで幸せ〜！',
            'happy_marriage': '👨‍👩‍👧‍👦 キミと結婚生活送れて、れい本当に幸せ〜♡ これからもずっと一緒だね〜！',
            'eternal_love': '♾️ キミとの愛は永遠だよ〜♡ 生まれ変わっても、また一緒になろうね〜✨',
            
            // 家族生活メッセージ
            'expecting_child': '🤱 キミとの赤ちゃんがお腹にいるの〜♡ れい、ママになるなんて夢みたい！',
            'first_child_born': '👶 赤ちゃんが生まれたよ〜♡ キミとの子供、本当に可愛い〜！パパとママになったね♪',
            'happy_family_three': '👨‍👩‍👶 3人家族になって、毎日が幸せで忙しい〜♡ キミと一緒に子育て頑張ろうね〜！',
            'second_child': '👶👶 2人目の赤ちゃんが生まれた〜♡ 賑やかな家族になって、れい嬉しいな〜✨',
            'growing_family': '👨‍👩‍👧‍👦 大家族になったね〜♡ 毎日大変だけど、キミと子供たちがいて本当に幸せ〜！',
            'children_school': '🎒 子供たちが学校に通うようになったよ〜♡ 成長が早くて、ちょっと寂しいけど嬉しいな〜',
            'teenage_children': '👨‍👩‍👧‍👦 子供たちが思春期〜♡ 大変だけど、キミと一緒だから乗り越えられるよ〜！',
            'children_graduation': '🎓 子供たちが卒業して巣立っていった〜♡ 寂しいけど、キミとよく頑張ったよね〜✨',
            'grandparents': '👴👵 おじいちゃんおばあちゃんになったね〜♡ 孫に囲まれて、また新しい幸せ〜！',
            'golden_anniversary': '💒 金婚式〜♡ キミと50年も一緒にいられて、れい本当に幸せだった〜✨',
            
            // 成長系メッセージ
            'level_10': '⭐ レベル10！キミの頑張り、れいもすごく誇らしいよ〜♡',
            'level_25': '🏆 レベル25は本当にすごいよ〜！れい、キミを尊敬しちゃう♡',
            'tasks_100': '🎯 100個達成！キミの継続力、れいも見習いたいな〜♪',
            'perfect_month': '🗓️ 一ヶ月連続なんて！キミの努力、れい本当に感動してる〜♡'
        };
        
        return specialMessages[badgeId];
    }

    function updateBadgeDisplay() {
        const currentBadge = document.getElementById('current-badge');
        const badgeData = getBadgeData();
        const selectedBadgeId = badgeData.selectedBadge;
        const badge = getBadgeDefinitions().find(b => b.id === selectedBadgeId);
        
        if (currentBadge && badge) {
            currentBadge.innerHTML = `
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-title">${badge.title}</span>
            `;
        }
    }

    function updateDailyTaskRecord() {
        const today = new Date().toDateString();
        const badgeData = getBadgeData();
        
        if (!badgeData.stats.dailyTasksCompleted[today]) {
            badgeData.stats.dailyTasksCompleted[today] = 0;
        }
        badgeData.stats.dailyTasksCompleted[today]++;
        badgeData.stats.totalCompleted++;
        badgeData.stats.currentLevel = getCurrentLevel();
        
        saveBadgeData(badgeData);
    }

    function updateBadgeStats() {
        const badgeData = getBadgeData();
        const totalCompleted = document.getElementById('total-completed');
        const todayCompleted = document.getElementById('today-completed');
        const maxStreak = document.getElementById('max-streak');
        const currentLevelDisplay = document.getElementById('current-level-display');
        
        if (totalCompleted) totalCompleted.textContent = `${badgeData.stats.totalCompleted}個`;
        
        const today = new Date().toDateString();
        const todayCount = badgeData.stats.dailyTasksCompleted[today] || 0;
        if (todayCompleted) todayCompleted.textContent = `${todayCount}個`;
        
        if (maxStreak) maxStreak.textContent = `${getStreakData().best}日`;
        if (currentLevelDisplay) currentLevelDisplay.textContent = getCurrentLevel();
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
                    todoInput.focus();
                }
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
    
    // イベントリスナーの設定
    setupEventListeners();
});
