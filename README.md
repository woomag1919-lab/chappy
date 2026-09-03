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
