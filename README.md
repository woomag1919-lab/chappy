# CoreLingual

会話のすれ違いを、特性の違いからやさしく読み解く Web アプリ。

## 構成（整理版）

```
index.html          … マークアップ中心
css/app.css         … スタイル
js/
  data.js           … 軸・質問データ
  profiles.js       … プロフィール
  diagnosis.js      … 特性チェック
  compare.js        … 2人比較（画面）
  invite.js         … 招待
  analyze.js        … 会話解析 UI
  radar.js          … レーダー描画
  app.js            … 初期化・画面配線
  compare-export.js … 比較カード画像出力
  v112/v113/v120-fixes.js … 段階パッチ（後で本体へ吸収予定）
api/                … Vercel Serverless
assets/             … 比較テンプレ画像
```

## スクリプト読み込み順

data → profiles → diagnosis → compare → invite → analyze → radar → app → compare-export → fixes

## デプロイ

Vercel。環境変数: `DATABASE_URL`, `GEMINI_API_KEY`

## このZIPについて

GitHub 上で分割途中だった配線を整理したもの。

- インライン JS を廃止し外部ファイルに統一
- 読み込まれていなかった invite / analyze / app / v120 を接続
- app.css の重複リンクを1つに
- レーダー処理を js/radar.js に外出し
- title を CoreLingual に更新
