// れいのToDo - レベル・経験値システムモジュール
export class ExpSystem {
    constructor() {
        this.expData = {
            currentExp: 0,
            currentLevel: 1,
            totalExp: 0
        };
        this.loadExpData();
    }

    loadExpData() {
        const saved = localStorage.getItem('expData');
        if (saved) {
            this.expData = { ...this.expData, ...JSON.parse(saved) };
        }
    }

    saveExpData() {
        localStorage.setItem('expData', JSON.stringify(this.expData));
    }

    addExp(amount) {
        this.expData.currentExp += amount;
        this.expData.totalExp += amount;
        
        const levelUpResult = this.checkLevelUp();
        this.saveExpData();
        
        return {
            expGained: amount,
            currentExp: this.expData.currentExp,
            levelUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel,
            messages: levelUpResult.messages
        };
    }

    checkLevelUp() {
        const messages = [];
        let leveledUp = false;
        let newLevel = this.expData.currentLevel;
        
        while (this.expData.currentExp >= this.getExpToNextLevel()) {
            const expToNext = this.getExpToNextLevel();
            this.expData.currentExp -= expToNext;
            this.expData.currentLevel++;
            newLevel = this.expData.currentLevel;
            leveledUp = true;
            
            const levelUpMessages = [
                `🎉 レベル${this.expData.currentLevel}になったよ〜♡ おめでとう✨`,
                `✨ Lv.${this.expData.currentLevel}達成〜♪ れいも嬉しい〜！`,
                `🌟 レベルアップ〜！Lv.${this.expData.currentLevel}だよ〜♡`,
                `🎊 やったね〜！レベル${this.expData.currentLevel}おめでとう〜✨`
            ];
            
            const randomMessage = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
            messages.push(randomMessage);
            
            // 特別なレベルでの追加メッセージ
            if (this.expData.currentLevel % 10 === 0) {
                messages.push(`🏆 Lv.${this.expData.currentLevel}は記念すべきレベルだね！本当にお疲れさま♡`);
            }
        }
        
        return { leveledUp, newLevel, messages };
    }

    getExpToNextLevel() {
        return 100 + (this.expData.currentLevel - 1) * 50;
    }

    getCurrentLevel() {
        return this.expData.currentLevel;
    }

    getCurrentExp() {
        return this.expData.currentExp;
    }

    getExpToNext() {
        return this.getExpToNextLevel();
    }

    getExpProgress() {
        const expToNext = this.getExpToNextLevel();
        return Math.round((this.expData.currentExp / expToNext) * 100);
    }

    getExpData() {
        return { ...this.expData };
    }
}
