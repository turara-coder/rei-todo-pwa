// れいのToDo - メインアプリケーションクラス（リファクタリング版）
import { TodoManager } from './modules/todo-manager.js';
import { ExpSystem } from './modules/exp-system.js';
import { UIComponents } from './modules/ui-components.js';

class ReiTodoApp {
    constructor() {
        this.todoManager = new TodoManager();
        this.expSystem = new ExpSystem();
        this.ui = new UIComponents();
        
        // 状態管理
        this.streakData = this.loadStreakData();
        this.badgeData = this.loadBadgeData();
        this.themeData = this.loadThemeData();
        
        // PWA関連
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePWA();
        this.updateAllDisplays();
        this.checkOnlineStatus();
    }

    setupEventListeners() {
        // フォーム送信
        const todoForm = document.getElementById('todo-form');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => this.handleTodoSubmit(e));
        }

        // クリアボタン
        const clearDatetimeBtn = document.getElementById('clear-datetime');
        if (clearDatetimeBtn) {
            clearDatetimeBtn.addEventListener('click', this.clearDateTime);
        }

        // 繰り返し設定
        const repeatTypeSelect = document.getElementById('repeat-type');
        if (repeatTypeSelect) {
            repeatTypeSelect.addEventListener('change', this.updateNextRepeatDate);
        }

        // PWA関連
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        window.addEventListener('appinstalled', () => {
            this.hideInstallBanner();
            this.ui.showReiMessage('ホーム画面に追加されたよ〜♡ ありがとう✨');
        });

        // オンライン・オフライン
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineNotice();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineNotice();
        });

        // モーダル関連
        this.setupModalEvents();
    }

    setupModalEvents() {
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

    handleTodoSubmit(e) {
        e.preventDefault();
        
        const todoInput = document.getElementById('todo-input');
        const dueDateInput = document.getElementById('due-date');
        const dueTimeInput = document.getElementById('due-time');
        const repeatTypeSelect = document.getElementById('repeat-type');
        
        if (!todoInput) return;
        
        const todoText = todoInput.value.trim();
        const dueDate = dueDateInput ? dueDateInput.value : '';
        const dueTime = dueTimeInput ? dueTimeInput.value : '';
        const repeatType = repeatTypeSelect ? repeatTypeSelect.value : 'none';
        
        if (todoText) {
            const result = this.todoManager.addTodo(todoText, dueDate, dueTime, repeatType);
            
            if (result.success) {
                this.ui.showReiMessage(result.message);
                e.target.reset();
                this.updateAllDisplays();
                todoInput.focus();
            } else {
                this.ui.showReiMessage(result.message);
            }
        }
    }

    // グローバル関数（HTML内から呼び出し用）
    toggleComplete(id) {
        const result = this.todoManager.toggleComplete(id);
        
        if (result.success && result.completed) {
            // 経験値追加
            const expResult = this.expSystem.addExp(result.expGain);
            
            // ストリーク更新
            this.updateStreakOnCompletion();
            
            // 統計更新
            this.updateDailyTaskRecord();
            
            // メッセージ表示
            this.ui.showReiMessage(result.message);
            
            // レベルアップメッセージ
            if (expResult.levelUp) {
                expResult.messages.forEach((msg, index) => {
                    setTimeout(() => this.ui.showReiMessage(msg), (index + 1) * 2000);
                });
            }
            
            // バッジチェック
            setTimeout(() => this.checkAndUnlockBadges(), 1000);
        }
        
        this.updateAllDisplays();
    }

    deleteTodo(id) {
        const result = this.todoManager.deleteTodo(id);
        
        if (result.success) {
            this.ui.showReiMessage(result.message);
            this.updateAllDisplays();
        }
    }

    updateAllDisplays() {
        // タスクリスト更新
        this.ui.displayTodos(this.todoManager.getTodos());
        
        // プログレス更新
        this.ui.updateProgress(this.todoManager.getProgress());
        
        // 経験値表示更新
        const expData = this.expSystem.getExpData();
        this.ui.updateExpDisplay({
            ...expData,
            expToNext: this.expSystem.getExpToNext()
        });
        
        // ストリーク表示更新
        this.ui.updateStreakDisplay(this.streakData);
    }

    // データ読み込み関数群
    loadStreakData() {
        const saved = localStorage.getItem('streakData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            current: 0,
            best: 0,
            lastCompletionDate: null
        };
    }

    loadBadgeData() {
        const saved = localStorage.getItem('badgeData');
        if (saved) {
            return JSON.parse(saved);
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

    loadThemeData() {
        const saved = localStorage.getItem('themeData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            currentTheme: 'default',
            unlockedThemes: ['default']
        };
    }

    // PWA関連
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed', err));
        }
    }

    showInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.classList.remove('hidden');
        }
    }

    hideInstallBanner() {
        const installBanner = document.getElementById('install-banner');
        if (installBanner) {
            installBanner.classList.add('hidden');
        }
    }

    checkOnlineStatus() {
        if (!this.isOnline) {
            this.showOfflineNotice();
        }
    }

    showOfflineNotice() {
        const offlineNotice = document.getElementById('offline-notice');
        if (offlineNotice) {
            offlineNotice.classList.remove('hidden');
        }
    }

    hideOfflineNotice() {
        const offlineNotice = document.getElementById('offline-notice');
        if (offlineNotice) {
            offlineNotice.classList.add('hidden');
        }
    }

    // その他のメソッド（実装が必要）
    updateStreakOnCompletion() {
        // ストリーク更新ロジック
        const today = new Date().toDateString();
        const lastDate = this.streakData.lastCompletionDate;
        
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.streakData.current++;
            } else {
                this.streakData.current = 1;
            }
            
            this.streakData.lastCompletionDate = today;
            this.streakData.best = Math.max(this.streakData.best, this.streakData.current);
            
            localStorage.setItem('streakData', JSON.stringify(this.streakData));
        }
    }

    updateDailyTaskRecord() {
        const today = new Date().toDateString();
        if (!this.badgeData.stats.dailyTasksCompleted[today]) {
            this.badgeData.stats.dailyTasksCompleted[today] = 0;
        }
        this.badgeData.stats.dailyTasksCompleted[today]++;
        this.badgeData.stats.totalCompleted++;
        
        localStorage.setItem('badgeData', JSON.stringify(this.badgeData));
    }

    checkAndUnlockBadges() {
        // バッジアンロックチェック
        // 実装省略
    }

    clearDateTime() {
        const dueDateInput = document.getElementById('due-date');
        const dueTimeInput = document.getElementById('due-time');
        
        if (dueDateInput) dueDateInput.value = '';
        if (dueTimeInput) dueTimeInput.value = '';
    }

    updateNextRepeatDate() {
        // 次回繰り返し日付の更新
        // 実装省略
    }

    openBadgeModal() {
        // バッジモーダルを開く
        // 実装省略
    }

    closeBadgeModal() {
        const badgeModal = document.getElementById('badge-modal');
        if (badgeModal) {
            badgeModal.classList.add('hidden');
        }
    }

    openThemeModal() {
        // テーマモーダルを開く
        // 実装省略
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

export default ReiTodoApp;
