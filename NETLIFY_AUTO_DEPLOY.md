# Netlify自動デプロイ設定ガイド

## 🔄 手動アップロードから自動デプロイに切り替える方法

### Step 1: GitHubにリポジトリを作成

1. **GitHub**（https://github.com）でログイン
2. **New repository**をクリック
3. リポジトリ名: `rei-todo-pwa`
4. **Public**に設定
5. **Create repository**をクリック

### Step 2: ローカルファイルをGitHubにアップロード

```bash
# プロジェクトフォルダで実行
cd /home/loki/rei-project/rei-todo-pwa

# Gitを初期化
git init
git add .
git commit -m "初回アップロード: れいのToDo PWA"

# GitHubと連携（YOUR_USERNAMEを自分のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/rei-todo-pwa.git
git branch -M main
git push -u origin main
```

### Step 3: NetlifyでGit連携を設定

1. **Netlifyダッシュボード**にアクセス
2. 現在のサイトの**Site settings**をクリック
3. **Build & deploy**セクションで**Link repository**をクリック
4. **GitHub**を選択
5. 作成した`rei-todo-pwa`リポジトリを選択
6. **Link repository**をクリック

### Step 4: 自動デプロイの確認

```bash
# ファイルを修正後、GitHubにpush
git add .
git commit -m "アップデート: 新機能追加"
git push
```

**結果**: Netlifyが自動的に検知して、数分後にサイトが更新される！✨

## 🎯 今後のアップデート手順

### 通常の更新作業
```bash
# 1. ファイルを編集
# 2. 変更をコミット
git add .
git commit -m "更新内容の説明"

# 3. GitHubにプッシュ
git push

# 4. Netlifyが自動でデプロイ（何もしなくてOK！）
```

## 💡 メリット

- ✅ **自動更新**: pushするだけで自動デプロイ
- ✅ **バージョン管理**: GitHubで履歴管理
- ✅ **ロールバック**: 問題があれば前のバージョンに戻せる
- ✅ **プレビュー**: プルリクエストで事前確認可能
- ✅ **チーム開発**: 複数人での開発が可能

## 🔍 デプロイ状況の確認

Netlifyダッシュボードの**Deploys**タブで：
- デプロイ履歴
- ビルドログ
- エラー確認
が可能です。

## ⚡ すぐにできる簡単テスト

1. `README.md`などを少し編集
2. `git add . && git commit -m "テスト更新" && git push`
3. Netlifyで自動デプロイされるのを確認！
