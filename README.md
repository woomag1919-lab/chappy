# CoreLingual v55

会話のすれ違いを、特性チェックを土台に読み解くWebアプリ。

## UI（v55）
特性チェックを **自分 / 相手** の2タブに整理。
- **自分**: 手入力・診断（前半→広告→後半）・反映・共有
- **相手**: 「こんな人だと思う」でOKの手入力・診断・**相手に頼む**（共有ボタンなし）
- 招待成功時のプロフィール名は **「相手の回答」** を自動作成

## ファイル
- index.html / package.json / vercel.json
- api/translate.js, invite.js, share.js, cleanup.js
- sql/corelingual_db_v34.sql

## デプロイ
Vercel ルートに配置。環境変数: DATABASE_URL, GEMINI_API_KEY（任意 PUBLIC_BASE_URL）。
Neon で sql を一度実行（未実行の場合）。
