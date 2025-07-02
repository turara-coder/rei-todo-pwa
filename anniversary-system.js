// れいのToDo PWA版 - 記念日システム

class AnniversarySystem {
    constructor() {
        this.anniversaries = [];
        this.checkInterval = null;
        this.lastCheckDate = null;
    }

    // ローカル日付を YYYY-MM-DD 形式で取得
    formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 初期化
    init() {
        this.loadAnniversaries();
        this.startDailyCheck();
        this.checkTodayAnniversaries();
    }

    // 記念日データ読み込み
    loadAnniversaries() {
        const saved = localStorage.getItem('anniversaries');
        if (saved) {
            this.anniversaries = JSON.parse(saved);
        }
        
        // デフォルトの記念日
        this.ensureDefaultAnniversaries();
    }

    // デフォルト記念日の確保
    ensureDefaultAnniversaries() {
        const hasFirstMeeting = this.anniversaries.some(a => a.id === 'first-meeting');
        
        if (!hasFirstMeeting) {
            // 初回利用日を記念日として追加
            const firstUseDate = localStorage.getItem('firstUseDate');
            if (!firstUseDate) {
                const today = this.formatLocalDate(new Date());
                localStorage.setItem('firstUseDate', today);
                
                this.addAnniversary({
                    id: 'first-meeting',
                    name: 'れいちゃんとの出会い記念日',
                    date: today,
                    type: 'yearly',
                    icon: '💕',
                    isDefault: true,
                    messages: [
                        '出会えて本当に嬉しいよ〜♡ これからもよろしくね〜✨',
                        '今日は特別な日だね〜♡ 一緒に素敵な思い出作ろう〜！',
                        'れいと出会ってくれてありがとう〜♡ ずっと一緒だよ〜✨'
                    ]
                });
            }
        }
    }

    // 記念日追加
    addAnniversary(anniversary) {
        const newAnniversary = {
            id: anniversary.id || Date.now().toString(),
            name: anniversary.name,
            date: anniversary.date,
            type: anniversary.type || 'yearly', // yearly, monthly, once
            icon: anniversary.icon || '🎉',
            isDefault: anniversary.isDefault || false,
            messages: anniversary.messages || [
                `${anniversary.name}おめでとう〜♡`,
                `今日は${anniversary.name}だね〜✨ 素敵な一日にしよう〜！`,
                `${anniversary.name}を一緒に祝えて嬉しいよ〜♡`
            ],
            createdAt: this.formatLocalDate(new Date())
        };
        
        this.anniversaries.push(newAnniversary);
        this.saveAnniversaries();
        
        if (window.showReiMessage) {
            window.showReiMessage(`記念日「${anniversary.name}」を追加したよ〜♡`);
        }
        
        return newAnniversary;
    }

    // 記念日削除
    deleteAnniversary(id) {
        const anniversary = this.anniversaries.find(a => a.id === id);
        if (anniversary && anniversary.isDefault) {
            if (window.showReiMessage) {
                window.showReiMessage('この記念日は削除できないよ〜💦');
            }
            return false;
        }
        
        this.anniversaries = this.anniversaries.filter(a => a.id !== id);
        this.saveAnniversaries();
        
        if (window.showReiMessage) {
            window.showReiMessage('記念日を削除したよ〜');
        }
        
        return true;
    }

    // 記念日保存
    saveAnniversaries() {
        localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
    }

    // 毎日のチェック開始
    startDailyCheck() {
        // 毎日0時に確認
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow - now;
        
        // 最初の確認
        setTimeout(() => {
            this.checkTodayAnniversaries();
            
            // その後24時間ごとに確認
            this.checkInterval = setInterval(() => {
                this.checkTodayAnniversaries();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    // 今日の記念日確認
    checkTodayAnniversaries() {
        const today = new Date();
        const todayStr = this.formatLocalDate(today);
        
        // 既に今日チェック済みなら何もしない
        if (this.lastCheckDate === todayStr) return;
        
        this.lastCheckDate = todayStr;
        const todayAnniversaries = this.getTodayAnniversaries();
        
        if (todayAnniversaries.length > 0) {
            // 記念日がある場合、特別な演出
            setTimeout(() => {
                todayAnniversaries.forEach((anniversary, index) => {
                    setTimeout(() => {
                        this.celebrateAnniversary(anniversary);
                    }, index * 3000);
                });
            }, 2000);
        }
    }

    // 今日の記念日取得
    getTodayAnniversaries() {
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        const todayYear = today.getFullYear();
        
        return this.anniversaries.filter(anniversary => {
            const annDate = new Date(anniversary.date);
            const annMonth = annDate.getMonth() + 1;
            const annDay = annDate.getDate();
            const annYear = annDate.getFullYear();
            
            switch (anniversary.type) {
                case 'yearly':
                    return annMonth === todayMonth && annDay === todayDate;
                case 'monthly':
                    return annDay === todayDate;
                case 'once':
                    return anniversary.date === this.formatLocalDate(today);
                default:
                    return false;
            }
        });
    }

    // 記念日を祝う
    celebrateAnniversary(anniversary) {
        // ランダムメッセージ選択
        const message = anniversary.messages[
            Math.floor(Math.random() * anniversary.messages.length)
        ];
        
        // 特別なメッセージ表示
        if (window.showReiMessage) {
            window.showReiMessage(`${anniversary.icon} ${message}`, 10000);
        }
        
        // 祝福アニメーション
        if (window.celebrationSystem) {
            window.celebrationSystem.celebrateSpecialDay(anniversary.name);
        }
        
        // 記念日カウンター更新
        this.updateAnniversaryCounter(anniversary);
    }

    // 記念日カウンター更新
    updateAnniversaryCounter(anniversary) {
        const firstDate = new Date(anniversary.date);
        const today = new Date();
        
        let count = 0;
        let unit = '';
        
        switch (anniversary.type) {
            case 'yearly':
                count = today.getFullYear() - firstDate.getFullYear();
                unit = '年目';
                break;
            case 'monthly':
                const months = (today.getFullYear() - firstDate.getFullYear()) * 12 + 
                              (today.getMonth() - firstDate.getMonth());
                count = months;
                unit = 'ヶ月目';
                break;
            default:
                return;
        }
        
        if (count > 0) {
            setTimeout(() => {
                if (window.showReiMessage) {
                    window.showReiMessage(`今日で${count}${unit}だね〜♡ これからもよろしく〜✨`, 8000);
                }
            }, 3000);
        }
    }

    // 次の記念日までの日数取得
    getDaysUntilNext(anniversaryId) {
        const anniversary = this.anniversaries.find(a => a.id === anniversaryId);
        if (!anniversary) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const annDate = new Date(anniversary.date);
        let nextDate;
        
        switch (anniversary.type) {
            case 'yearly':
                nextDate = new Date(today.getFullYear(), annDate.getMonth(), annDate.getDate());
                if (nextDate < today) {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
                break;
            case 'monthly':
                nextDate = new Date(today.getFullYear(), today.getMonth(), annDate.getDate());
                if (nextDate < today) {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                break;
            case 'once':
                nextDate = new Date(anniversary.date);
                break;
        }
        
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    // 記念日モーダル表示
    showAnniversaryModal() {
        const modal = document.createElement('div');
        modal.className = 'anniversary-modal';
        modal.innerHTML = `
            <div class="anniversary-modal-content">
                <div class="anniversary-modal-header">
                    <h3>💝 記念日の管理</h3>
                    <button class="anniversary-modal-close" onclick="anniversarySystem.closeModal()">×</button>
                </div>
                <div class="anniversary-modal-body">
                    <div class="anniversary-add-form">
                        <h4>新しい記念日を追加</h4>
                        <input type="text" id="ann-name" placeholder="記念日の名前（例：初デート記念日）">
                        <input type="date" id="ann-date" value="${this.formatLocalDate(new Date())}">
                        <select id="ann-type">
                            <option value="yearly">毎年</option>
                            <option value="monthly">毎月</option>
                            <option value="once">一度だけ</option>
                        </select>
                        <input type="text" id="ann-icon" placeholder="アイコン（例：💑）" value="🎉">
                        <button onclick="anniversarySystem.addFromModal()">追加する</button>
                    </div>
                    <div class="anniversary-list">
                        <h4>登録済みの記念日</h4>
                        ${this.renderAnniversaryList()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 記念日リスト描画
    renderAnniversaryList() {
        if (this.anniversaries.length === 0) {
            return '<p class="no-anniversaries">まだ記念日が登録されていません</p>';
        }
        
        return this.anniversaries.map(ann => {
            const daysUntil = this.getDaysUntilNext(ann.id);
            const deleteBtn = ann.isDefault ? '' : 
                `<button class="ann-delete-btn" onclick="anniversarySystem.deleteAnniversary('${ann.id}')">🗑️</button>`;
            
            return `
                <div class="anniversary-item">
                    <div class="ann-icon">${ann.icon}</div>
                    <div class="ann-info">
                        <div class="ann-name">${ann.name}</div>
                        <div class="ann-details">
                            ${ann.date} (${this.getTypeText(ann.type)})
                            ${daysUntil !== null ? `・あと${daysUntil}日` : ''}
                        </div>
                    </div>
                    ${deleteBtn}
                </div>
            `;
        }).join('');
    }

    // タイプテキスト取得
    getTypeText(type) {
        const types = {
            'yearly': '毎年',
            'monthly': '毎月',
            'once': '一度だけ'
        };
        return types[type] || type;
    }

    // モーダルから追加
    addFromModal() {
        const name = document.getElementById('ann-name').value;
        const date = document.getElementById('ann-date').value;
        const type = document.getElementById('ann-type').value;
        const icon = document.getElementById('ann-icon').value || '🎉';
        
        if (!name || !date) {
            if (window.showReiMessage) {
                window.showReiMessage('名前と日付を入力してね〜💦');
            }
            return;
        }
        
        this.addAnniversary({ name, date, type, icon });
        this.closeModal();
        
        // すぐに再表示
        setTimeout(() => this.showAnniversaryModal(), 100);
    }

    // モーダルを閉じる
    closeModal() {
        const modal = document.querySelector('.anniversary-modal');
        if (modal) {
            modal.remove();
        }
    }

    // クリーンアップ
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// スタイル追加
const anniversaryStyle = document.createElement('style');
anniversaryStyle.textContent = `
.anniversary-modal {
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

.anniversary-modal-content {
    background: white;
    border-radius: 15px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.anniversary-modal-header {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.anniversary-modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
}

.anniversary-modal-close {
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

.anniversary-modal-close:hover {
    background: rgba(255,255,255,0.2);
}

.anniversary-modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: calc(80vh - 80px);
}

.anniversary-add-form {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.anniversary-add-form h4 {
    margin: 0 0 1rem 0;
    color: #333;
}

.anniversary-add-form input,
.anniversary-add-form select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.anniversary-add-form button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.anniversary-add-form button:hover {
    transform: translateY(-2px);
}

.anniversary-list h4 {
    margin: 0 0 1rem 0;
    color: #333;
}

.anniversary-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 10px;
    transition: transform 0.2s;
}

.anniversary-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.ann-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ann-info {
    flex: 1;
}

.ann-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.ann-details {
    font-size: 0.85rem;
    color: #666;
}

.ann-delete-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
}

.ann-delete-btn:hover {
    background: #ee5a52;
}

.no-anniversaries {
    text-align: center;
    color: #999;
    padding: 2rem;
}

@media (max-width: 480px) {
    .anniversary-modal-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .anniversary-modal-body {
        padding: 1rem;
    }
}
`;
document.head.appendChild(anniversaryStyle);

// グローバルに公開
window.AnniversarySystem = AnniversarySystem;