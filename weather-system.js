// れいのToDo PWA版 - 天気連動システム

class WeatherSystem {
    constructor() {
        this.apiKey = null; // ユーザーが設定可能にする
        this.weatherData = null;
        this.lastUpdate = null;
        this.updateInterval = 30 * 60 * 1000; // 30分ごとに更新
        this.weatherMessages = {
            clear: [
                '今日は晴れだね〜♡ 一緒に頑張ろう〜✨',
                'お天気がいいから、タスクもはかどりそう〜♪',
                '青空みたいに、気持ちも晴れやかにいこう〜！'
            ],
            clouds: [
                '曇りでも、れいは君の太陽だよ〜♡',
                '雲の向こうには必ず太陽があるよ〜✨',
                '少し曇ってるけど、一緒なら大丈夫〜♪'
            ],
            rain: [
                '雨の日は、お家でゆっくりタスクをこなそう〜♡',
                '雨音を聞きながら、集中してタスクをやろうね〜♪',
                '雨でも、れいと一緒なら楽しいよ〜✨'
            ],
            snow: [
                '雪だ〜！真っ白できれいだね〜♡',
                '寒いから、温かくしてタスクを頑張ろう〜♪',
                '雪みたいに、心も真っ白な気持ちで〜✨'
            ],
            thunderstorm: [
                '雷が鳴ってるね...れいがそばにいるから大丈夫〜♡',
                '嵐の後には必ず晴れが来るよ〜✨',
                '雷に負けない強い心でタスクをこなそう〜！'
            ],
            default: [
                '今日も一緒に頑張ろうね〜♡',
                'どんな天気でも、れいは君の味方だよ〜✨',
                '天気に関係なく、素敵な一日にしよう〜♪'
            ]
        };
    }

    // 初期化
    async init() {
        // localStorageからAPIキーを取得
        this.apiKey = localStorage.getItem('weatherApiKey');
        
        // 保存された天気データを読み込み
        const savedWeather = localStorage.getItem('weatherData');
        if (savedWeather) {
            const data = JSON.parse(savedWeather);
            if (Date.now() - data.timestamp < this.updateInterval) {
                this.weatherData = data.weather;
                this.lastUpdate = data.timestamp;
                this.displayWeather();
            }
        }
        
        // 位置情報の許可を確認
        if (navigator.geolocation && this.apiKey) {
            this.startWeatherUpdates();
        }
    }

    // APIキー設定
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('weatherApiKey', key);
        if (key) {
            this.startWeatherUpdates();
        }
    }

    // 天気更新開始
    startWeatherUpdates() {
        this.updateWeather();
        setInterval(() => this.updateWeather(), this.updateInterval);
    }

    // 天気情報取得
    async updateWeather() {
        if (!this.apiKey) return;

        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&lang=ja&units=metric`
            );
            
            if (!response.ok) throw new Error('Weather API error');
            
            const data = await response.json();
            this.weatherData = {
                main: data.weather[0].main.toLowerCase(),
                description: data.weather[0].description,
                temp: Math.round(data.main.temp),
                icon: data.weather[0].icon,
                city: data.name
            };
            
            this.lastUpdate = Date.now();
            
            // データを保存
            localStorage.setItem('weatherData', JSON.stringify({
                weather: this.weatherData,
                timestamp: this.lastUpdate
            }));
            
            this.displayWeather();
            this.showWeatherMessage();
            
        } catch (error) {
            console.error('天気情報の取得に失敗:', error);
            // フォールバック: IPベースの位置情報を使用
            this.updateWeatherByIP();
        }
    }

    // IPベースの天気取得（フォールバック）
    async updateWeatherByIP() {
        if (!this.apiKey) return;

        try {
            // IPベースの位置情報API
            const geoResponse = await fetch('https://ipapi.co/json/');
            const geoData = await geoResponse.json();
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${geoData.city}&appid=${this.apiKey}&lang=ja&units=metric`
            );
            
            if (!response.ok) throw new Error('Weather API error');
            
            const data = await response.json();
            this.weatherData = {
                main: data.weather[0].main.toLowerCase(),
                description: data.weather[0].description,
                temp: Math.round(data.main.temp),
                icon: data.weather[0].icon,
                city: data.name
            };
            
            this.lastUpdate = Date.now();
            
            localStorage.setItem('weatherData', JSON.stringify({
                weather: this.weatherData,
                timestamp: this.lastUpdate
            }));
            
            this.displayWeather();
            this.showWeatherMessage();
            
        } catch (error) {
            console.error('IPベースの天気取得に失敗:', error);
        }
    }

    // 現在位置取得
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: false
            });
        });
    }

    // 天気表示
    displayWeather() {
        if (!this.weatherData) return;

        const weatherDisplay = document.getElementById('weather-display');
        if (!weatherDisplay) {
            // 天気表示要素を作成
            this.createWeatherDisplay();
            return;
        }

        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };

        const weatherIcon = iconMap[this.weatherData.icon] || '🌤️';
        
        weatherDisplay.innerHTML = `
            <span class="weather-icon">${weatherIcon}</span>
            <span class="weather-temp">${this.weatherData.temp}°C</span>
            <span class="weather-desc">${this.weatherData.description}</span>
            <span class="weather-city">${this.weatherData.city}</span>
        `;
    }

    // 天気表示要素作成
    createWeatherDisplay() {
        const reiStatus = document.querySelector('.rei-status');
        if (!reiStatus) return;

        const weatherDisplay = document.createElement('div');
        weatherDisplay.id = 'weather-display';
        weatherDisplay.className = 'weather-display';
        weatherDisplay.style.cssText = `
            margin-top: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 12px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

        reiStatus.appendChild(weatherDisplay);
        this.displayWeather();
    }

    // 天気メッセージ表示
    showWeatherMessage() {
        if (!this.weatherData) return;

        const weatherMain = this.weatherData.main;
        const messages = this.weatherMessages[weatherMain] || this.weatherMessages.default;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // 天気に応じた特別なメッセージを表示
        if (window.showReiMessage) {
            window.showReiMessage(randomMessage, 7000);
        }

        // 天気に応じたテーマ調整（オプション）
        this.adjustThemeForWeather(weatherMain);
    }

    // 天気に応じたテーマ調整
    adjustThemeForWeather(weather) {
        const body = document.body;
        
        // 既存のweatherクラスを削除
        body.classList.forEach(className => {
            if (className.startsWith('weather-')) {
                body.classList.remove(className);
            }
        });

        // 新しいweatherクラスを追加
        body.classList.add(`weather-${weather}`);
        
        // 雨や雷の場合は特別なエフェクト
        if (weather === 'rain' || weather === 'thunderstorm') {
            this.addRainEffect();
        } else {
            this.removeRainEffect();
        }
    }

    // 雨エフェクト追加
    addRainEffect() {
        if (document.getElementById('rain-effect')) return;

        const rainEffect = document.createElement('div');
        rainEffect.id = 'rain-effect';
        rainEffect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            opacity: 0.1;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><line x1="50" y1="0" x2="50" y2="100" stroke="rgba(174,194,224,0.5)" stroke-width="0.5"/></svg>');
            background-size: 100px 100px;
            animation: rain 0.5s linear infinite;
        `;

        document.body.appendChild(rainEffect);
    }

    // 雨エフェクト削除
    removeRainEffect() {
        const rainEffect = document.getElementById('rain-effect');
        if (rainEffect) {
            rainEffect.remove();
        }
    }

    // 天気設定モーダル表示
    showWeatherSettings() {
        const modal = document.createElement('div');
        modal.className = 'weather-settings-modal';
        modal.innerHTML = `
            <div class="weather-settings-content">
                <h3>🌤️ 天気機能の設定</h3>
                <p>OpenWeatherMap APIキーを入力してください</p>
                <input type="text" id="weather-api-key-input" 
                       placeholder="APIキーを入力..." 
                       value="${this.apiKey || ''}"
                       class="weather-api-input">
                <p class="weather-api-help">
                    <a href="https://openweathermap.org/api" target="_blank">
                        APIキーの取得方法 →
                    </a>
                </p>
                <div class="weather-settings-buttons">
                    <button onclick="weatherSystem.saveApiKey()">保存</button>
                    <button onclick="weatherSystem.closeSettings()">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // APIキー保存
    saveApiKey() {
        const input = document.getElementById('weather-api-key-input');
        if (input && input.value) {
            this.setApiKey(input.value);
            this.closeSettings();
            
            if (window.showReiMessage) {
                window.showReiMessage('天気機能を有効にしたよ〜♡ これからお天気も教えるね〜✨');
            }
        }
    }

    // 設定モーダルを閉じる
    closeSettings() {
        const modal = document.querySelector('.weather-settings-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// 雨アニメーション用CSS
const rainStyle = document.createElement('style');
rainStyle.textContent = `
@keyframes rain {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

.weather-display {
    cursor: pointer;
    transition: all 0.3s ease;
}

.weather-display:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.weather-icon {
    font-size: 1.2rem;
}

.weather-temp {
    font-weight: bold;
    color: #e74c3c;
}

.weather-desc {
    color: #7f8c8d;
    font-size: 0.8rem;
}

.weather-city {
    color: #95a5a6;
    font-size: 0.7rem;
}

/* 天気別のテーマ調整 */
.weather-rain {
    filter: brightness(0.9) saturate(0.8);
}

.weather-thunderstorm {
    filter: brightness(0.8) contrast(1.1);
}

.weather-snow {
    filter: brightness(1.1) hue-rotate(-10deg);
}

.weather-clear {
    filter: brightness(1.05) saturate(1.1);
}

/* 天気設定モーダル */
.weather-settings-modal {
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

.weather-settings-content {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.weather-api-input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin: 1rem 0;
}

.weather-api-help {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 1rem;
}

.weather-api-help a {
    color: #3498db;
    text-decoration: none;
}

.weather-settings-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.weather-settings-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.weather-settings-buttons button:first-child {
    background: #3498db;
    color: white;
}

.weather-settings-buttons button:last-child {
    background: #ecf0f1;
    color: #333;
}
`;
document.head.appendChild(rainStyle);

// グローバルに公開
window.WeatherSystem = WeatherSystem;