# CoreLingual v73

- V72の縦スクロール／ページスナップUIをベースに、プロフィール編集と比較ページを整理。
- プロフィール名入力を「名前をつける」として最上部へ移動。
- プロフィール編集画面の自分／相手タブ、プロフィールチップ、特性チェック内の手入力入口を削除。
- プロフィール編集画面に「このプロフィールを削除する」を追加（確認ダイアログ付き）。
- 会話入力欄を拡大し、不要な「会話を入力」「右側＝自分／左側＝相手」の説明を削除。
- 解析結果がある場合は「まだ解析結果はありません」のプレースホルダーを非表示。
- STEP 4を「2人のコミュニケーション比較」中心に簡素化し、比較対象の再選択UIを削除。
- 比較カードの画像保存機能を追加。広告接続前は開発用5秒ゲートを表示し、広告なしの比較カードPNGを保存。
- 既存の会話解析API・Gemini処理は変更していません。

# CoreLingual v59

- 2人比較のタイトル二重表示を解消
- 「いま比較中：A × B」を表示
- あなた側／相手側のドロップダウンで組み合わせ変更
- 診断・招待反映時にプロフィールへ scores を保存


## v59
- 2人比較カードに「いま比較中」の表示と、あなた側／相手側の比較プロフィール選択を追加。
- 外枠の「2人のコミュニケーション比較」見出しは1つだけに整理。


## v61-safe build
v60を動作基準として、v61 Grok版から招待の先着1人ロックのみを移植。Gemini/会話解析関連ファイルはv60から変更していない。


## v64 changes
- Based on v61-safe_savedialog_v2.
- Profile save confirmation and empty-name validation retained.
- Added a 60,000-character live counter to the main analysis text input.
- Added host-side invite partner-name field only when the invite-create UI could be safely identified; the name is intended to remain host-side and is not shown to invite respondents.


## v65 changes
- Based on v64_noaki.
- Keeps the working v60-based analysis stack unchanged in normal successful requests.
- Adds actionable error messages for image-size limits, AI rate limiting, timeouts, temporary service failures, unreadable/empty AI results, and invalid requests.
- Frontend now maps HTTP errors to user-friendly guidance instead of a single generic analysis error.


## v68
- Geminiの5xxエラー時に、HTTP code / provider status / provider message / Retry-After を安全に診断情報として返します。
- 画面にも「Gemini診断情報」として表示し、原因特定をしやすくしました。
- APIキーや画像データなどの秘密情報は表示しません。
- 解析プロンプト、画像圧縮、通常成功時の結果処理は変更していません。


## v68
- Gemini 503/UNAVAILABLE の一時的な高負荷に対して、同一モデルを1回自動再試行。
- それでも503の場合は `GEMINI_FALLBACK_MODEL`（既定: `gemini-3.6-flash`）へ自動フォールバック。
- Gemini 3.xの非推奨サンプリング設定 `temperature` を送信しない構成に整理。
- 503時は安全な診断情報と試行モデルを画面に表示。APIキーや画像データは表示しない。
