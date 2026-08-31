# CoreLingual_v34

## 構成
- `index.html`: v34の動作版をベースに、v34のAPI契約へ接続
- `api/invite.js`: 招待API。owner/partnerの共有設定をキー認証
- `api/share.js`: 共有結果API（7日TTL）
- `api/cleanup.js`: 期限切れデータのcron掃除
- `api/translate.js`: Gemini会話解析。diagnosisContextを正式にプロンプトへ投入
- `sql/corelingual_db_v34.sql`: DBスキーマ

## Vercel環境変数
- `GEMINI_API_KEY` 必須
- `GEMINI_MODEL` 任意。未設定時は `gemini-3.6-flash`
- `DATABASE_URL` 推奨（既存環境との互換のため `POSTGRES_URL` / `STORAGE_URL` も一部APIで受け付けます）
- `PUBLIC_BASE_URL` 任意。本番URLを明示する場合に設定

## v34の重点
- translateのdiagnosisContext契約を明確化
- Gemini APIキーをクエリ文字列からヘッダーへ変更
- 入力サイズ、画像枚数/MIME、発言者をサーバ側でも検証
- Gemini JSONの軽いスキーマ検証と安全なフォールバック
- 本番レスポンスから内部エラーを露出しない
- invite.jsをESMへ統一
- 招待の共有設定変更にownerToken / partnerKeyを要求

## 注意
特性チェックは診断・判定ではありません。会話解析では実際の会話内容を最優先し、特性情報は補助材料として扱います。
