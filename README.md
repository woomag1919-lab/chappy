# CoreLingual v54

会話のすれ違いを、特性チェックを土台に読み解くWebアプリ。

## 含まれるファイル
- `index.html` … フロント一式
- `api/translate.js` … 会話解析（Gemini）
- `api/invite.js` … 2人招待
- `api/share.js` … 結果共有リンク
- `api/cleanup.js` … 期限切れ掃除（cron）
- `package.json` … ESM + Neon
- `vercel.json` … `/share/:token` リライト + cron
- `sql/corelingual_db_v34.sql` … Neon用テーブル

## デプロイ（Vercel）
1. このフォルダをルートにデプロイ
2. 環境変数: `DATABASE_URL`（または `POSTGRES_URL` / `STORAGE_URL`）, `GEMINI_API_KEY`
3. Neon で `sql/corelingual_db_v34.sql` を一度実行
4. 任意: `PUBLIC_BASE_URL`（招待URLのベース）

## v54 で直した招待まわり
- 相手プロフィール受信時に `scores` / `radar` を answers から復元（2人比較が空になる問題）
- 招待ペイロードに `scores` を含める + API の cleanProfile で保持
- 前半18問だけで送信していた古い listener を削除（36問完了後のみ送信）
- owner / partner トークン長を API の 40–60 文字ルールに近づける
