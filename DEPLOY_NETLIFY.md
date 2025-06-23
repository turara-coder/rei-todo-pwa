# Netlifyデプロイ手順

## 🌟 Netlifyとは

- 静的サイトのホスティングサービス
- ドラッグ&ドロップでデプロイ可能
- 自動HTTPS、高速CDN、カスタムドメイン対応

## 🚀 デプロイ手順

### Method 1: ドラッグ&ドロップ（超簡単）

1. **Netlifyアカウント作成**
   - https://netlify.com にアクセス
   - 無料アカウントを作成

2. **フォルダをZIP化**
   ```bash
   # プロジェクトフォルダを圧縮
   zip -r rei-todo-pwa.zip /path/to/rei-todo-pwa
   ```

3. **Netlifyにドラッグ&ドロップ**
   - Netlifyダッシュボードで「Sites」タブ
   - 「Deploy manually」にZIPファイルをドラッグ
   - 自動的にデプロイ開始

4. **URLが生成される**
   - `https://random-name-12345.netlify.app/` のようなURLが自動生成

### Method 2: Git連携（推奨）

1. **GitHubにプッシュ**（前述の手順）

2. **Netlifyでサイト作成**
   - 「New site from Git」をクリック
   - GitHubを選択
   - リポジトリを選択
   - 設定はデフォルトのまま「Deploy site」

3. **自動デプロイ設定完了**
   - GitHubにプッシュすると自動的に更新

## ⚙️ 設定ファイル（オプション）

プロジェクトルートに `netlify.toml` を作成：

```toml
[build]
  publish = "."

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

# PWA用のリダイレクト設定
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}
```

## 🔧 カスタムドメイン設定

1. ドメインを購入（お名前.com等）
2. Netlify の「Domain settings」
3. 「Add custom domain」
4. DNS設定を変更

## 📱 結果

- URL: `https://your-site-name.netlify.app/`
- 高速配信（世界中のCDN）
- 自動HTTPS
- PWA完全対応
