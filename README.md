# CoreLingual v74

v73_fixed をベースにした改善版。

## 今回の主な変更

- 共有リンクを開いたとき、トップの縦スクロールUIを表示せず、共有された解析結果だけを直接表示するよう修正。
- プロフィール編集画面の重複した「プロフィール」表記・説明文を整理。
- 「会話の傾向」は折りたたみ式に変更し、プロフィール画面を開いた瞬間に大量の選択肢が並ばないよう整理。
- プロフィール画面上部から「🧩 特性チェックをする」をすぐ押せる導線に整理。
- ダウンロード比較カードを全面刷新。「比較結果のスクリーンショット」ではなく「2人のコミュニケーションカード」として、2人を一言で表すタイトル、各自の特徴、すれ違いやすいポイント、2人への会話のヒントをカード専用文章で表示。
- 比較カードは既存のアプリ内比較UIとは独立したSVGデザイン。既存の広告5秒ゲートとダウンロード導線は維持。
- カード専用コピーはフロント側のルールベース生成で、Gemini APIを追加消費しない。

## v73_fixedからの安全性

- v73_fixed のイベント登録・既存機能は基本的に維持。
- 比較カードは生成ロジックを置き換えるだけで、アプリ内比較UIそのものは変更していない。
- v73で発生した「存在しない要素へのonclick参照」による全画面操作不能バグは再導入していない。

## V75 profile editor polish
- Profile editor sheet is vertically centered instead of bottom-anchored, so it appears higher on mobile.
- Opening a new profile no longer auto-focuses the name field, preventing the mobile keyboard from covering the actions.
- Profile editor order is now: name → trait check → collapsible conversation tendencies → memo → delete.
- The trait-check action is moved into the active profile pane between the name/save row and the collapsible tendencies section.
