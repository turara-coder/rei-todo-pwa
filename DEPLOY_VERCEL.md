# Vercelデプロイ手順

## ⚡ Vercelとは

Next.jsの開発元が提供する高速ホスティングサービス
- 世界最速のCDN
- 自動HTTPS
- Git連携で自動デプロイ

## 🚀 デプロイ手順

### Method 1: Vercel CLI（推奨）

1. **Node.jsとVercel CLIをインストール**
   ```bash
   # Node.jsがない場合はインストール
   npm install -g vercel
   ```

2. **プロジェクトディレクトリでデプロイ**
   ```bash
   cd /path/to/rei-todo-pwa
   vercel
   ```

3. **質問に答える**
   - アカウント作成/ログイン
   - プロジェクト名を入力
   - 設定はデフォルトでOK

4. **URLが表示される**
   - `https://rei-todo-pwa-xxxx.vercel.app/`

### Method 2: Git連携

1. **Vercelアカウント作成**
   - https://vercel.com でGitHubアカウントでログイン

2. **「New Project」をクリック**
   - GitHubリポジトリをインポート
   - 設定はデフォルトのまま「Deploy」

## ⚙️ 設定ファイル

プロジェクトルートに `vercel.json` を作成：

```json
{
  "rewrites": [
    {
      "source": "/sw.js",
      "destination": "/sw.js",
      "headers": {
        "cache-control": "no-cache"
      }
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

## 🔧 環境変数設定（必要に応じて）

Vercelダッシュボードで環境変数を設定可能

## 📱 結果

- 世界最速レベルの配信速度
- 自動スケーリング
- カスタムドメイン対応
