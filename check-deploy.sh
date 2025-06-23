#!/bin/bash

echo "🌸 れいのToDo PWA - デプロイ前チェック"
echo "=================================="

# 必要なファイルの存在確認
echo "📁 ファイル存在チェック..."

files=(
    "index.html"
    "app.js"
    "style.css" 
    "manifest.json"
    "sw.js"
    "icons/icon-192.png"
    "icons/icon-512.png"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file が見つかりません"
    fi
done

# JavaScriptファイルの構文チェック
echo ""
echo "🔍 JavaScript構文チェック..."

if command -v node &> /dev/null; then
    node -c app.js && echo "✅ app.js - 構文OK" || echo "❌ app.js - 構文エラー"
    
    if [ -f "js/app-refactored-v2.js" ]; then
        # ESモジュールは直接チェックできないのでファイル存在のみ確認
        echo "✅ js/app-refactored-v2.js - ファイル存在"
    fi
else
    echo "⚠️ Node.jsがインストールされていないため、構文チェックをスキップ"
fi

# マニフェストファイルのJSONチェック
echo ""
echo "📱 manifest.json チェック..."

if command -v python3 &> /dev/null; then
    python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null && echo "✅ manifest.json - JSON形式OK" || echo "❌ manifest.json - JSON形式エラー"
else
    echo "⚠️ Python3がインストールされていないため、JSONチェックをスキップ"
fi

# アイコンサイズチェック
echo ""
echo "🖼️ アイコンサイズチェック..."

if command -v identify &> /dev/null; then
    for icon in icons/*.png; do
        if [ -f "$icon" ]; then
            size=$(identify -format "%wx%h" "$icon" 2>/dev/null)
            echo "📏 $icon: $size"
        fi
    done
else
    echo "⚠️ ImageMagickがインストールされていないため、サイズチェックをスキップ"
fi

# ファイルサイズチェック
echo ""
echo "📊 ファイルサイズ確認..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | tr -d ' ')
        echo "📦 $file: ${size} bytes"
    fi
done

echo ""
echo "🚀 チェック完了！"
echo ""
echo "次のステップ:"
echo "1. GitHub Pages: GitHubにプッシュ → Settings → Pages で有効化"
echo "2. Netlify: https://netlify.com でドラッグ&ドロップ"
echo "3. Vercel: 'vercel' コマンドを実行"
echo ""
echo "デプロイ後は以下のテストを実行してください:"
echo "- PWA機能の動作確認"
echo "- オフライン動作の確認"
echo "- 各デバイスでの表示確認"
