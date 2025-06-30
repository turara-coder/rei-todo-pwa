// れいのToDo PWA版 - お祝いアニメーションシステム

class CelebrationSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#00d2d3'];
        this.sparkles = [];
    }

    // 初期化
    init() {
        this.createCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // キャンバス作成
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'celebration-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    // キャンバスサイズ調整
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // 紙吹雪パーティクル生成
    createConfetti(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * -15 - 5,
                angle: Math.random() * 360,
                angleVel: (Math.random() - 0.5) * 10,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 8 + 5,
                life: 1,
                decay: Math.random() * 0.01 + 0.005
            });
        }
    }

    // スパークル生成
    createSparkles(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.sparkles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * (Math.random() * 3 + 2),
                vy: Math.sin(angle) * (Math.random() * 3 + 2),
                size: Math.random() * 4 + 2,
                life: 1,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    // アニメーション更新
    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 紙吹雪更新
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.5; // 重力
            particle.angle += particle.angleVel;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) return false;
            
            // 描画
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.angle * Math.PI / 180);
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.ctx.restore();
            
            return true;
        });
        
        // スパークル更新
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.life -= sparkle.decay;
            sparkle.vx *= 0.98;
            sparkle.vy *= 0.98;
            
            if (sparkle.life <= 0) return false;
            
            // スパークル描画
            this.ctx.save();
            this.ctx.globalAlpha = sparkle.life;
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.size * sparkle.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            return true;
        });
        
        // アニメーション継続
        if (this.particles.length > 0 || this.sparkles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.update());
        } else {
            this.stopAnimation();
        }
    }

    // タスク完了祝福
    celebrateTaskCompletion(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.createConfetti(x, y, 30);
        this.createSparkles(x, y, 15);
        this.startAnimation();
        
        // 効果音再生（オプション）
        this.playCompletionSound();
    }

    // レベルアップ祝福
    celebrateLevelUp() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 大量の紙吹雪
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createConfetti(
                    centerX + (Math.random() - 0.5) * 200,
                    centerY,
                    50
                );
            }, i * 200);
        }
        
        // スパークル円形配置
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const radius = 100;
            setTimeout(() => {
                this.createSparkles(
                    centerX + Math.cos(angle) * radius,
                    centerY + Math.sin(angle) * radius,
                    10
                );
            }, i * 100);
        }
        
        this.startAnimation();
        this.playLevelUpSound();
    }

    // 称号獲得祝福
    celebrateBadgeUnlock(badgeIcon) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        
        // バッジアイコン表示アニメーション
        this.showBadgeAnimation(centerX, centerY, badgeIcon);
        
        // 周囲に紙吹雪
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            this.createConfetti(
                centerX + Math.cos(angle) * 150,
                centerY + Math.sin(angle) * 150,
                20
            );
        }
        
        this.startAnimation();
        this.playAchievementSound();
    }

    // バッジアニメーション表示
    showBadgeAnimation(x, y, icon) {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'badge-unlock-animation';
        badgeEl.innerHTML = `
            <div class="badge-unlock-icon">${icon}</div>
            <div class="badge-unlock-text">新しい称号獲得！</div>
        `;
        badgeEl.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) scale(0);
            z-index: 10000;
            animation: badgeUnlockPop 1s ease-out forwards;
        `;
        
        document.body.appendChild(badgeEl);
        
        setTimeout(() => {
            badgeEl.remove();
        }, 3000);
    }

    // 特別な日の祝福
    celebrateSpecialDay(message) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // ハート型の紙吹雪配置
        const heartPoints = this.getHeartPoints(centerX, centerY, 150);
        heartPoints.forEach((point, i) => {
            setTimeout(() => {
                this.createConfetti(point.x, point.y, 5);
                this.createSparkles(point.x, point.y, 3);
            }, i * 50);
        });
        
        // メッセージ表示
        this.showSpecialMessage(message);
        this.startAnimation();
    }

    // ハート型の座標取得
    getHeartPoints(cx, cy, size) {
        const points = [];
        for (let t = 0; t < Math.PI * 2; t += 0.1) {
            const x = cx + size * (16 * Math.pow(Math.sin(t), 3)) / 16;
            const y = cy - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
            points.push({ x, y });
        }
        return points;
    }

    // 特別メッセージ表示
    showSpecialMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'special-celebration-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%) scale(0);
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            padding: 20px 40px;
            border-radius: 30px;
            font-size: 1.5rem;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: specialMessagePop 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'specialMessageFade 0.5s ease-out forwards';
            setTimeout(() => messageEl.remove(), 500);
        }, 3000);
    }

    // アニメーション開始
    startAnimation() {
        if (!this.animationFrame) {
            this.update();
        }
    }

    // アニメーション停止
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    // 効果音再生メソッド（実装は任意）
    playCompletionSound() {
        // Web Audio APIを使用した効果音再生
        this.playSound(440, 0.1, 'sine'); // A4音
    }

    playLevelUpSound() {
        // レベルアップ音（上昇音階）
        [440, 554, 659, 880].forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.1, 'sine'), i * 100);
        });
    }

    playAchievementSound() {
        // 称号獲得音（ファンファーレ風）
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playSound(freq, 0.15, 'square'), i * 150);
        });
    }

    // シンプルな音生成
    playSound(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // 音声再生エラーは無視
        }
    }

    // クリーンアップ
    cleanup() {
        this.stopAnimation();
        if (this.canvas) {
            this.canvas.remove();
        }
        this.particles = [];
        this.sparkles = [];
    }
}

// グローバルに公開
window.CelebrationSystem = CelebrationSystem;