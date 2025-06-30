// れいのToDo PWA版 - 通知システム

class NotificationSystem {
    constructor() {
        this.permission = Notification.permission;
        this.scheduledNotifications = [];
        this.notificationSettings = {
            enabled: false,
            taskReminders: true,
            encouragements: true,
            reminderTime: 30, // 分前に通知
            dailyCheckIn: true,
            dailyCheckInTime: '09:00'
        };
        this.encouragementMessages = [
            'れいと一緒にタスクを頑張ろう〜♡',
            '今日も素敵な一日にしよう〜✨',
            'タスクがたまってきたよ〜！一緒に片付けよう〜♪',
            'れいが応援してるよ〜♡ ファイト〜！',
            '休憩も大切だよ〜♪ 無理しないでね〜✨'
        ];
    }

    // 初期化
    async init() {
        this.loadSettings();
        
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // 通知権限の状態を確認
            if (this.permission === 'granted' && this.notificationSettings.enabled) {
                this.startNotificationScheduler();
            }
        }
    }

    // 設定読み込み
    loadSettings() {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(saved) };
        }
    }

    // 設定保存
    saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    }

    // 通知権限リクエスト
    async requestPermission() {
        if (!('Notification' in window)) {
            if (window.showReiMessage) {
                window.showReiMessage('このブラウザは通知に対応してないみたい〜💦');
            }
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;

        if (permission === 'granted') {
            this.notificationSettings.enabled = true;
            this.saveSettings();
            this.startNotificationScheduler();
            
            if (window.showReiMessage) {
                window.showReiMessage('通知を有効にしたよ〜♡ これからタスクのお知らせをするね〜✨');
            }
            
            // テスト通知
            this.showNotification('れいのToDo', {
                body: '通知が有効になったよ〜♡',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-96.png'
            });
            
            return true;
        } else {
            if (window.showReiMessage) {
                window.showReiMessage('通知が許可されなかったよ〜💦 設定から変更できるよ〜');
            }
            return false;
        }
    }

    // 通知表示
    async showNotification(title, options = {}) {
        if (this.permission !== 'granted' || !this.notificationSettings.enabled) {
            return;
        }

        const defaultOptions = {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            vibrate: [200, 100, 200],
            tag: 'rei-todo-notification',
            renotify: true,
            requireInteraction: false,
            actions: [
                { action: 'open', title: '開く' },
                { action: 'dismiss', title: '閉じる' }
            ]
        };

        const notificationOptions = { ...defaultOptions, ...options };

        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, notificationOptions);
            } else {
                // フォールバック
                new Notification(title, notificationOptions);
            }
        } catch (error) {
            console.error('通知の表示に失敗:', error);
        }
    }

    // 通知スケジューラー開始
    startNotificationScheduler() {
        // 既存のスケジューラーをクリア
        this.stopNotificationScheduler();

        // タスクリマインダーチェック（5分ごと）
        if (this.notificationSettings.taskReminders) {
            this.scheduledNotifications.push(
                setInterval(() => this.checkTaskReminders(), 5 * 60 * 1000)
            );
            // 初回チェック
            this.checkTaskReminders();
        }

        // 日次チェックイン
        if (this.notificationSettings.dailyCheckIn) {
            this.scheduleDailyCheckIn();
        }

        // 応援メッセージ（2時間ごと）
        if (this.notificationSettings.encouragements) {
            this.scheduledNotifications.push(
                setInterval(() => this.sendEncouragement(), 2 * 60 * 60 * 1000)
            );
        }
    }

    // 通知スケジューラー停止
    stopNotificationScheduler() {
        this.scheduledNotifications.forEach(interval => clearInterval(interval));
        this.scheduledNotifications = [];
    }

    // タスクリマインダーチェック
    checkTaskReminders() {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const now = new Date();
        const reminderTime = this.notificationSettings.reminderTime * 60 * 1000; // ミリ秒に変換

        todos.forEach(todo => {
            if (!todo.completed && todo.dueDate) {
                const dueDate = new Date(todo.dueDate);
                const timeDiff = dueDate - now;

                // 期限前通知（設定時間前）
                if (timeDiff > 0 && timeDiff <= reminderTime && !todo.notified) {
                    this.showNotification('📅 タスクの期限が近づいてるよ〜！', {
                        body: `「${todo.text}」があと${Math.floor(timeDiff / 60000)}分で期限だよ〜💦`,
                        data: { todoId: todo.id, type: 'reminder' },
                        requireInteraction: true
                    });

                    // 通知済みフラグを立てる
                    todo.notified = true;
                    localStorage.setItem('todos', JSON.stringify(todos));
                }

                // 期限切れ通知
                if (timeDiff < 0 && !todo.overdueNotified) {
                    this.showNotification('⏰ タスクの期限が過ぎちゃった〜！', {
                        body: `「${todo.text}」の期限が過ぎてるよ〜💦 一緒に頑張ろう〜！`,
                        data: { todoId: todo.id, type: 'overdue' },
                        requireInteraction: true
                    });

                    todo.overdueNotified = true;
                    localStorage.setItem('todos', JSON.stringify(todos));
                }
            }
        });
    }

    // 日次チェックイン
    scheduleDailyCheckIn() {
        const checkInTime = this.notificationSettings.dailyCheckInTime;
        const [hours, minutes] = checkInTime.split(':').map(Number);
        
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // 今日の時間が過ぎていたら明日に設定
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const msUntilCheckIn = scheduledTime - now;

        setTimeout(() => {
            this.sendDailyCheckIn();
            
            // 24時間ごとに繰り返し
            this.scheduledNotifications.push(
                setInterval(() => this.sendDailyCheckIn(), 24 * 60 * 60 * 1000)
            );
        }, msUntilCheckIn);
    }

    // 日次チェックイン送信
    sendDailyCheckIn() {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const incompleteTasks = todos.filter(todo => !todo.completed).length;
        const todayTasks = todos.filter(todo => {
            if (!todo.dueDate) return false;
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            return dueDate.toDateString() === today.toDateString();
        }).length;

        let message = '';
        if (incompleteTasks === 0) {
            message = 'タスクが全部完了してるよ〜♡ すごいね〜✨';
        } else if (todayTasks > 0) {
            message = `今日は${todayTasks}個のタスクがあるよ〜！一緒に頑張ろう〜♪`;
        } else {
            message = `${incompleteTasks}個のタスクがあるよ〜！今日も一緒に頑張ろうね〜♡`;
        }

        this.showNotification('🌸 おはよう〜！れいだよ〜♡', {
            body: message,
            data: { type: 'daily-checkin' }
        });
    }

    // 応援メッセージ送信
    sendEncouragement() {
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const incompleteTasks = todos.filter(todo => !todo.completed).length;

        // タスクがない場合は送信しない
        if (incompleteTasks === 0) return;

        const message = this.encouragementMessages[
            Math.floor(Math.random() * this.encouragementMessages.length)
        ];

        this.showNotification('💝 れいからの応援メッセージ', {
            body: message,
            data: { type: 'encouragement' }
        });
    }

    // 通知設定モーダル表示
    showNotificationSettings() {
        const modal = document.createElement('div');
        modal.className = 'notification-settings-modal';
        modal.innerHTML = `
            <div class="notification-settings-content">
                <div class="notification-settings-header">
                    <h3>🔔 通知の設定</h3>
                    <button class="notification-settings-close" onclick="notificationSystem.closeSettings()">×</button>
                </div>
                <div class="notification-settings-body">
                    ${this.permission !== 'granted' ? `
                        <div class="notification-permission-request">
                            <p>通知を有効にすると、れいちゃんがタスクのリマインドをしてくれるよ〜♡</p>
                            <button onclick="notificationSystem.requestPermission()">通知を許可する</button>
                        </div>
                    ` : `
                        <div class="notification-settings-options">
                            <label class="notification-toggle">
                                <input type="checkbox" id="notif-enabled" 
                                       ${this.notificationSettings.enabled ? 'checked' : ''}
                                       onchange="notificationSystem.toggleNotifications(this.checked)">
                                <span>通知を有効にする</span>
                            </label>
                            
                            <div class="notification-options ${!this.notificationSettings.enabled ? 'disabled' : ''}">
                                <label class="notification-toggle">
                                    <input type="checkbox" id="notif-reminders" 
                                           ${this.notificationSettings.taskReminders ? 'checked' : ''}
                                           onchange="notificationSystem.updateSetting('taskReminders', this.checked)">
                                    <span>タスクの期限リマインダー</span>
                                </label>
                                
                                <div class="notification-time-setting">
                                    <label>期限の何分前に通知：</label>
                                    <input type="number" id="notif-reminder-time" 
                                           value="${this.notificationSettings.reminderTime}"
                                           min="5" max="120" step="5"
                                           onchange="notificationSystem.updateSetting('reminderTime', parseInt(this.value))">
                                    <span>分前</span>
                                </div>
                                
                                <label class="notification-toggle">
                                    <input type="checkbox" id="notif-encouragements" 
                                           ${this.notificationSettings.encouragements ? 'checked' : ''}
                                           onchange="notificationSystem.updateSetting('encouragements', this.checked)">
                                    <span>れいちゃんの応援メッセージ</span>
                                </label>
                                
                                <label class="notification-toggle">
                                    <input type="checkbox" id="notif-daily" 
                                           ${this.notificationSettings.dailyCheckIn ? 'checked' : ''}
                                           onchange="notificationSystem.updateSetting('dailyCheckIn', this.checked)">
                                    <span>毎日のチェックイン</span>
                                </label>
                                
                                <div class="notification-time-setting">
                                    <label>チェックイン時刻：</label>
                                    <input type="time" id="notif-daily-time" 
                                           value="${this.notificationSettings.dailyCheckInTime}"
                                           onchange="notificationSystem.updateSetting('dailyCheckInTime', this.value)">
                                </div>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 通知の有効/無効切り替え
    toggleNotifications(enabled) {
        this.notificationSettings.enabled = enabled;
        this.saveSettings();

        if (enabled) {
            this.startNotificationScheduler();
            if (window.showReiMessage) {
                window.showReiMessage('通知を有効にしたよ〜♡');
            }
        } else {
            this.stopNotificationScheduler();
            if (window.showReiMessage) {
                window.showReiMessage('通知を無効にしたよ〜');
            }
        }

        // UIの更新
        const optionsDiv = document.querySelector('.notification-options');
        if (optionsDiv) {
            optionsDiv.classList.toggle('disabled', !enabled);
        }
    }

    // 設定更新
    updateSetting(key, value) {
        this.notificationSettings[key] = value;
        this.saveSettings();

        // スケジューラーを再起動
        if (this.notificationSettings.enabled) {
            this.startNotificationScheduler();
        }
    }

    // 設定モーダルを閉じる
    closeSettings() {
        const modal = document.querySelector('.notification-settings-modal');
        if (modal) {
            modal.remove();
        }
    }

    // テスト通知送信
    sendTestNotification() {
        this.showNotification('🌸 テスト通知', {
            body: 'れいちゃんからのテスト通知だよ〜♡ ちゃんと届いたかな〜？',
            data: { type: 'test' }
        });
    }
}

// スタイル追加
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification-settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
}

.notification-settings-content {
    background: white;
    border-radius: 15px;
    max-width: 450px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.notification-settings-header {
    background: linear-gradient(45deg, #3498db, #2ecc71);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-settings-header h3 {
    margin: 0;
    font-size: 1.3rem;
}

.notification-settings-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}

.notification-settings-close:hover {
    background: rgba(255,255,255,0.2);
}

.notification-settings-body {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: calc(80vh - 80px);
}

.notification-permission-request {
    text-align: center;
    padding: 2rem 0;
}

.notification-permission-request p {
    margin-bottom: 1.5rem;
    color: #666;
}

.notification-permission-request button {
    padding: 12px 24px;
    background: linear-gradient(45deg, #3498db, #2ecc71);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.notification-permission-request button:hover {
    transform: translateY(-2px);
}

.notification-toggle {
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    cursor: pointer;
}

.notification-toggle input[type="checkbox"] {
    margin-right: 10px;
}

.notification-time-setting {
    padding: 0.75rem 0;
    padding-left: 25px;
}

.notification-time-setting label {
    margin-right: 10px;
    color: #666;
}

.notification-time-setting input {
    padding: 5px 10px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
}

.notification-options.disabled {
    opacity: 0.5;
    pointer-events: none;
}

@media (max-width: 480px) {
    .notification-settings-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .notification-settings-body {
        padding: 1rem;
    }
}
`;
document.head.appendChild(notificationStyle);

// グローバルに公開
window.NotificationSystem = NotificationSystem;