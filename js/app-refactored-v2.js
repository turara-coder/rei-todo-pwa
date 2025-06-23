// れいのToDo PWA版 - リファクタリング版メインアプリケーション
import { TodoManager } from './modules/todo-manager.js';
import { ExpSystem } from './modules/exp-system.js';
import { UIComponents } from './modules/ui-components.js';

class ReiTodoApp {
    constructor() {
        // モジュールのインスタンス化
        this.todoManager = new TodoManager();
        this.expSystem = new ExpSystem();
        this.ui = new UIComponents();
        
        // PWA関連
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        
        // ストリークデータ
        this.streakData = {
            current: 0,
            best: 0,
            lastCompletionDate: null
        };
        
        // バッジデータ
        this.badgeData = {
            unlockedBadges: ['first_meeting'],
            selectedBadge: 'first_meeting',
            stats: {
                totalCompleted: 0,
                dailyTasksCompleted: {},
                streakRecord: 0,
                currentLevel: 1
            }
        };
        
        // テーマデータ
        this.themeData = {
            currentTheme: 'default',
            unlockedThemes: ['default']
        };
        
        // 初期化
        this.initialize();
    }
    
    async initialize() {
        // データの読み込み
        this.loadStreakData();
        this.loadBadgeData();
        this.loadThemeData();
        
        // 初期表示の更新
        this.updateAllDisplays();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // PWAの初期化
        this.initializePWA();
        
        // テーマの適用
        this.applyCurrentTheme();
        
        // オンライン状態の確認
        this.checkOnlineStatus();
        
        console.log('🌸 れいのToDoアプリが起動したよ〜♡');
    }
    
    // ========== タスク操作 ==========
    addTodo(text, dueDate = '', dueTime = '', repeatType = 'none') {
        const result = this.todoManager.addTodo(text, dueDate, dueTime, repeatType);
        
        if (result.success) {
            this.updateAllDisplays();
            this.ui.showReiMessage(result.message);
        } else {
            this.ui.showReiMessage(result.message);
        }
        
        return result;
    }
    
    toggleComplete(id) {
        const result = this.todoManager.toggleComplete(id);
        
        if (result.success) {
            if (result.completed) {
                // 経験値追加
                const expResult = this.expSystem.addExp(result.expGain);
                
                // ストリーク更新
                this.updateStreakOnCompletion();
                
                // 統計更新
                this.updateDailyTaskRecord();
                
                // バッジチェック
                setTimeout(() => {
                    this.checkAndUnlockBadges();
                }, 1000);
                
                // 繰り返しタスクの処理
                if (result.todo.repeatType !== 'none') {
                    this.generateNextRepeatTask(result.todo);
                }
                
                // レベルアップメッセージの表示
                if (expResult.levelUp) {
                    expResult.messages.forEach((message, index) => {
                        setTimeout(() => {
                            this.ui.showReiMessage(message, 4000);
                        }, (index + 1) * 2000);
                    });
                }
                
                this.ui.showReiMessage(result.message);
            }
            
            this.updateAllDisplays();
        }
        
        return result;
    }
    
    deleteTodo(id) {
        const result = this.todoManager.deleteTodo(id);
        
        if (result.success) {
            this.updateAllDisplays();
            this.ui.showReiMessage(result.message);
        }
        
        return result;
    }
    
    // ========== 表示更新 ==========
    updateAllDisplays() {
        const todos = this.todoManager.getTodos();
        const progress = this.todoManager.getProgress();
        const expData = this.expSystem.getExpData();
        
        // UI更新
        this.ui.displayTodos(todos);
        this.ui.updateProgress(progress);
        this.ui.updateExpDisplay({
            ...expData,
            expToNext: this.expSystem.getExpToNext()
        });
        this.ui.updateStreakDisplay(this.streakData);
        
        // バッジ表示更新
        this.updateBadgeDisplay();
        
        // テーマの確認
        this.checkThemeUnlocks();
    }
    
    // ========== ストリーク機能 ==========
    updateStreakOnCompletion() {
        const today = new Date().toDateString();
        const lastDate = this.streakData.lastCompletionDate;
        
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.streakData.current++;
            } else if (lastDate !== today) {
                this.streakData.current = 1;
            }
            
            this.streakData.lastCompletionDate = today;
            
            if (this.streakData.current > this.streakData.best) {
                this.streakData.best = this.streakData.current;
            }
            
            this.saveStreakData();
        }
    }
    
    updateDailyTaskRecord() {
        const today = new Date().toDateString();
        if (!this.badgeData.stats.dailyTasksCompleted[today]) {
            this.badgeData.stats.dailyTasksCompleted[today] = 0;
        }
        this.badgeData.stats.dailyTasksCompleted[today]++;
        this.badgeData.stats.totalCompleted++;
        this.saveBadgeData();
    }
    
    // ========== バッジシステム ==========
    checkAndUnlockBadges() {
        const badges = this.getBadgeDefinitions();
        let newBadges = [];
        
        badges.forEach(badge => {
            if (!this.badgeData.unlockedBadges.includes(badge.id) && 
                this.checkBadgeCondition(badge)) {
                this.badgeData.unlockedBadges.push(badge.id);
                newBadges.push(badge);
            }
        });
        
        if (newBadges.length > 0) {
            this.saveBadgeData();
            newBadges.forEach(badge => {
                setTimeout(() => {
                    this.ui.showReiMessage(`🏅 新しい称号を獲得したよ〜！「${badge.title}」✨`);
                }, 1000);
            });
        }
    }
    
    getBadgeDefinitions() {
        return [
            {
                id: 'first_meeting',
                title: 'れいとの出会い',
                description: 'れいちゃんとの最初の一歩♡',
                icon: '🌸',
                condition: { type: 'default' }
            },
            {
                id: 'first_task',
                title: '初めてのお手伝い',
                description: '最初のタスクを完了したよ〜♪',
                icon: '✨',
                condition: { type: 'totalCompleted', value: 1 }
            },
            {
                id: 'task_master',
                title: 'タスクマスター',
                description: '10個のタスクを完了！すごいじゃない〜♡',
                icon: '⭐',
                condition: { type: 'totalCompleted', value: 10 }
            },
            {
                id: 'streak_3',
                title: '3日坊主脱出',
                description: '3日連続でタスクを完了したよ〜♪',
                icon: '🔥',
                condition: { type: 'streak', value: 3 }
            },
            {
                id: 'level_5',
                title: 'れいとの絆レベル5',
                description: 'レベル5に到達！仲良くなったね〜♡',
                icon: '💖',
                condition: { type: 'level', value: 5 }
            }
        ];
    }
    
    checkBadgeCondition(badge) {
        const condition = badge.condition;
        
        switch (condition.type) {
            case 'default':
                return true;
            case 'totalCompleted':
                return this.badgeData.stats.totalCompleted >= condition.value;
            case 'streak':
                return this.streakData.current >= condition.value;
            case 'level':
                return this.expSystem.getCurrentLevel() >= condition.value;
            default:
                return false;
        }
    }
    
    updateBadgeDisplay() {
        const currentBadgeElement = document.getElementById('current-badge');
        if (!currentBadgeElement) return;
        
        const badge = this.getBadgeDefinitions().find(b => b.id === this.badgeData.selectedBadge);
        if (badge) {
            currentBadgeElement.innerHTML = `
                <span class="badge-icon">${badge.icon}</span>
                <span class="badge-title">${badge.title}</span>
            `;
        }
    }
    
    // ========== テーマシステム ==========
    checkThemeUnlocks() {
        const currentLevel = this.expSystem.getCurrentLevel();
        const themeDefinitions = this.getThemeDefinitions();
        let newUnlocks = [];
        
        Object.values(themeDefinitions).forEach(theme => {
            if (currentLevel >= theme.unlockLevel && !this.themeData.unlockedThemes.includes(theme.id)) {
                this.themeData.unlockedThemes.push(theme.id);
                newUnlocks.push(theme);
            }
        });
        
        if (newUnlocks.length > 0) {
            this.saveThemeData();
            newUnlocks.forEach(theme => {
                setTimeout(() => {
                    this.ui.showReiMessage(theme.unlockMessage);
                }, 500);
            });
        }
    }
    
    getThemeDefinitions() {
        return {
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
            }
        };
    }
    
    applyCurrentTheme() {
        const themeDefinitions = this.getThemeDefinitions();
        document.body.classList.remove(...Object.keys(themeDefinitions).map(id => `theme-${id}`));
        document.body.classList.add(`theme-${this.themeData.currentTheme}`);
    }
    
    // ========== 繰り返しタスク ==========
    generateNextRepeatTask(originalTodo) {
        const nextDate = this.calculateNextRepeatDate(originalTodo.dueDate, originalTodo.repeatType);
        if (nextDate) {
            const newTodo = {
                ...originalTodo,
                id: Date.now() + Math.random(),
                completed: false,
                dueDate: nextDate,
                isRepeated: true,
                createdAt: new Date()
            };
            
            this.todoManager.todos.push(newTodo);
            this.todoManager.saveTodos();
            
            this.ui.showReiMessage(`🔄 繰り返しタスク「${originalTodo.text}」を次回分として追加したよ〜♪`);
        }
    }
    
    calculateNextRepeatDate(currentDate, repeatType) {
        if (!currentDate) return null;
        
        const date = new Date(currentDate);
        
        switch (repeatType) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            default:
                return null;
        }
        
        return date;
    }
    
    // ========== データ永続化 ==========
    loadStreakData() {
        const saved = localStorage.getItem('streakData');
        if (saved) {
            this.streakData = { ...this.streakData, ...JSON.parse(saved) };
        }
    }
    
    saveStreakData() {
        localStorage.setItem('streakData', JSON.stringify(this.streakData));
    }
    
    loadBadgeData() {
        const saved = localStorage.getItem('badgeData');
        if (saved) {
            this.badgeData = { ...this.badgeData, ...JSON.parse(saved) };
        }
    }
    
    saveBadgeData() {
        localStorage.setItem('badgeData', JSON.stringify(this.badgeData));
    }
    
    loadThemeData() {
        const saved = localStorage.getItem('themeData');
        if (saved) {
            this.themeData = { ...this.themeData, ...JSON.parse(saved) };
        }
    }
    
    saveThemeData() {
        localStorage.setItem('themeData', JSON.stringify(this.themeData));
    }
    
    // ========== PWA機能 ==========
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed', err));
        }
        
        // PWAインストールプロンプト
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });
        
        // PWAがインストールされた時
        window.addEventListener('appinstalled', () => {
            this.hideInstallBanner();
            this.ui.showReiMessage('ホーム画面に追加されたよ〜♡ ありがとう✨');
        });
    }
    
    showInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('hidden');
        }
    }
    
    hideInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }
    
    checkOnlineStatus() {
        if (!this.isOnline) {
            this.showOfflineNotice();
        }
    }
    
    showOfflineNotice() {
        const notice = document.getElementById('offline-notice');
        if (notice) {
            notice.classList.remove('hidden');
        }
    }
    
    hideOfflineNotice() {
        const notice = document.getElementById('offline-notice');
        if (notice) {
            notice.classList.add('hidden');
        }
    }
    
    // ========== イベントリスナー設定 ==========
    setupEventListeners() {
        // フォーム送信
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        const dueDateInput = document.getElementById('due-date');
        const dueTimeInput = document.getElementById('due-time');
        const repeatTypeSelect = document.getElementById('repeat-type');
        
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!todoInput) return;
                
                const todoText = todoInput.value.trim();
                const dueDate = dueDateInput ? dueDateInput.value : '';
                const dueTime = dueTimeInput ? dueTimeInput.value : '';
                const repeatType = repeatTypeSelect ? repeatTypeSelect.value : 'none';
                
                if (todoText) {
                    this.addTodo(todoText, dueDate, dueTime, repeatType);
                    todoForm.reset();
                    todoInput.focus();
                }
            });
        }
        
        // 日時クリアボタン
        const clearDatetimeBtn = document.getElementById('clear-datetime');
        if (clearDatetimeBtn) {
            clearDatetimeBtn.addEventListener('click', () => {
                if (dueDateInput) dueDateInput.value = '';
                if (dueTimeInput) dueTimeInput.value = '';
            });
        }
        
        // PWAインストール関連
        const installButton = document.getElementById('install-button');
        const dismissBanner = document.getElementById('dismiss-banner');
        
        if (installButton) {
            installButton.addEventListener('click', () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('PWAインストールが受け入れられました');
                        }
                        this.deferredPrompt = null;
                    });
                }
            });
        }
        
        if (dismissBanner) {
            dismissBanner.addEventListener('click', () => {
                this.hideInstallBanner();
            });
        }
        
        // オンライン・オフライン状態の監視
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineNotice();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineNotice();
        });
        
        // モーダル関連のイベントリスナーも追加
        this.setupModalListeners();
    }
    
    setupModalListeners() {
        // バッジモーダル
        const badgeSettingsBtn = document.getElementById('badge-settings-btn');
        const badgeModal = document.getElementById('badge-modal');
        const badgeModalClose = document.getElementById('badge-modal-close');
        
        if (badgeSettingsBtn) {
            badgeSettingsBtn.addEventListener('click', () => this.openBadgeModal());
        }
        if (badgeModalClose) {
            badgeModalClose.addEventListener('click', () => this.closeBadgeModal());
        }
        if (badgeModal) {
            badgeModal.addEventListener('click', (e) => {
                if (e.target === badgeModal) this.closeBadgeModal();
            });
        }
        
        // テーマモーダル
        const themeSettingsBtn = document.getElementById('theme-settings-btn');
        const themeModal = document.getElementById('theme-modal');
        const themeModalClose = document.getElementById('theme-modal-close');
        
        if (themeSettingsBtn) {
            themeSettingsBtn.addEventListener('click', () => this.openThemeModal());
        }
        if (themeModalClose) {
            themeModalClose.addEventListener('click', () => this.closeThemeModal());
        }
        if (themeModal) {
            themeModal.addEventListener('click', (e) => {
                if (e.target === themeModal) this.closeThemeModal();
            });
        }
    }
    
    // ========== モーダル操作 ==========
    openBadgeModal() {
        const badgeModal = document.getElementById('badge-modal');
        if (badgeModal) {
            badgeModal.classList.remove('hidden');
        }
    }
    
    closeBadgeModal() {
        const badgeModal = document.getElementById('badge-modal');
        if (badgeModal) {
            badgeModal.classList.add('hidden');
        }
    }
    
    openThemeModal() {
        const themeModal = document.getElementById('theme-modal');
        if (themeModal) {
            themeModal.classList.remove('hidden');
        }
    }
    
    closeThemeModal() {
        const themeModal = document.getElementById('theme-modal');
        if (themeModal) {
            themeModal.classList.add('hidden');
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ReiTodoApp();
    
    // グローバル関数としてエクスポート（HTML内から呼び出し用）
    window.toggleComplete = (id) => window.app.toggleComplete(id);
    window.deleteTodo = (id) => window.app.deleteTodo(id);
});
