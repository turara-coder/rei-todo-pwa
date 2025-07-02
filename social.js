// れいのToDo PWA版 - SNSシェアシステム

class SocialSystem {
    constructor() {
        this.shareBtn = null;
    }

    init() {
        this.shareBtn = document.getElementById('share-btn');
        if (!this.shareBtn) return;

        this.shareBtn.addEventListener('click', () => this.share());
    }

    share() {
        const shareData = {
            title: 'れいのToDo',
            text: 'れいちゃんと一緒にタスク管理しよう！',
            url: location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => console.error('Share failed', err));
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
                alert('リンクをコピーしました！');
            }).catch(err => console.error('Clipboard error', err));
        } else {
            alert(shareData.url);
        }
    }
}

// グローバルに公開
window.SocialSystem = SocialSystem;
