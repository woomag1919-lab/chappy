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

## v76 changes
- Profile save redesigned: name input no longer has an inline save button; one full-width save action is placed below memo and above delete.
- Successful save closes the profile sheet and shows a small toast instead of the blocking save-confirm dialog.
- The saved form values are no longer cleared on successful save.
- User-facing ASD/ADHD wording in trait explanations was softened to neutral "関連する特性" language; internal calculation keys remain unchanged.

- V77: ユーザー向け表示からASD/ADHD/HSPの名称を外し、関連するコミュニケーション上の特徴・傾向として表現。Geminiの解析出力にも同名称が出ないよう指示し、万一出力された場合もAPI側で表示前に中立表現へ置換。愛着パターンは現状維持。

## v78 changes
- Redesigned the downloadable 2-person communication card as a dedicated “communication card,” not a screenshot-like report.
- Added card-only sections: pair title, strengths, likely friction, how each person may be perceived, what each person may need for reassurance, and practical tips for both people.
- Kept the existing 5-second ad gate and download flow; app comparison UI remains unchanged.
- Softened the trait-check disclaimer: removed repeated per-card disclaimer text and added one gentle overall note.

## v79
- Reworked the downloadable 2-person communication card into a poster-like, share-first design rather than a report layout.
- Removed stacked report sections, axis label, score-style framing, and repeated "good/bad" disclaimer from the downloadable card.
- Card now focuses on: brand, short relationship title, two-person contrast, one central story, and one practical tip for each person.
- Added short rule-based copy per comparison axis; no additional Gemini call is used for card generation.
- Kept the existing 5-second ad gate and SVG-to-PNG download flow.
- Kept the in-app comparison UI unchanged.
- Softened diagnosis-related explanatory copy in trait/profile helper text; user-facing labels remain communication-feature oriented.


## v80
- Downloadable comparison card redesigned as a poster-like communication card.
- Removed report-style horizontal rules and stacked boxes.
- Uses a warm ivory/rose background, large relationship title, two-person contrast, short story, and compact two-person prescription.
- Keeps existing ad gate, SVG-to-PNG download flow, and in-app comparison UI unchanged.
