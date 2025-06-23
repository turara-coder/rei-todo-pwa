# GitHub Pagesデプロイ手順

## 📝 準備

1. **GitHubアカウントを作成**（まだの場合）
   - https://github.com にアクセス
   - 無料アカウントを作成

2. **新しいリポジトリを作成**
   - リポジトリ名: `rei-todo-pwa`
   - Public に設定
   - README.md を含める

## 🚀 デプロイ手順

### Step 1: ファイルをGitHubにアップロード

```bash
# ローカルでGitを初期化
cd /path/to/rei-todo-pwa
git init
git add .
git commit -m "初回コミット: れいのToDo PWA"

# GitHubリポジトリと連携
git remote add origin https://github.com/YOUR_USERNAME/rei-todo-pwa.git
git branch -M main
git push -u origin main
```

### Step 2: GitHub Pages を有効化

1. GitHubのリポジトリページで「Settings」タブをクリック
2. 左サイドバーの「Pages」をクリック
3. Source で「Deploy from a branch」を選択
4. Branch で「main」を選択、フォルダは「/ (root)」
5. 「Save」をクリック

### Step 3: アクセス確認

数分後、以下のURLでアクセス可能になります：
- `https://YOUR_USERNAME.github.io/rei-todo-pwa/`

## 🔧 GitHub Pages用の最適化

### index.html の調整（必要に応じて）

相対パスの確認とService Workerの調整が必要な場合があります。

### HTTPS対応

GitHub PagesはHTTPS対応なので、PWA機能が完全に動作します！

## 📱 使用方法

1. スマホのブラウザで上記URLにアクセス
2. 「ホーム画面に追加」でアプリ化
3. どこからでもアクセス可能！

## 💡 メリット

- ✅ 完全無料
- ✅ 世界中からアクセス可能
- ✅ HTTPS対応（PWA対応）
- ✅ CDN配信で高速
- ✅ 自動デプロイ（コミット時）
