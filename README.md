# P&ID バルブ操作シミュレーター

化学プラントのP&ID（配管計装図）を再現し、バルブ操作で液体の到達をシミュレーションするツール。

## 特徴
- DCS画面のような操作感でバルブを開閉
- BFSアルゴリズムによるリアルタイム到達判定
- SVGベースのP&ID図描画
- SVGファイルをアプリ上から読み込み（draw.io対応）
- 教育・訓練モード（フェーズ/ステップ/安全ルール）

## 技術スタック
- React + TypeScript + Vite
- Vitest + @testing-library/react

## セットアップ

```bash
npm install
```

## 開発コマンド

```bash
npm run dev                 # 開発サーバー
npm test                    # テスト実行
npm run build               # ビルド
npm run process:check       # ローカルプロセス検証（Wチェック1stゲート）
npm run process:new-issue -- StepX-Y タイトル
npm run process:new-r-issue -- "内容" 種別 優先度
npm run process:install-hooks # commit-msg フックを有効化（任意）
```

## コミットメッセージ規約

形式:

```text
<type>(<scope>): <summary> [StepX-Y|rN]
```

`type`:
- `feat|fix|refactor|docs|test|chore|ci|perf|sec|process`

例:
- `fix(svg): sanitize imported attributes [Step5-3]`
- `process(logs): enforce issue template checks [r21]`

## ドキュメント
- 要件定義: `docs/requirements/REQUIREMENTS.md`
- 開発計画: `docs/process/PLAN.md`
- 開発プロセス: `docs/process/DEVELOPMENT_PROCESS.md`
- LLM運用ガイド: `docs/process/LLM_GUIDE.md`
- 専門家パネル運用: `docs/process/EXPERT_PANEL.md`
- アーキテクチャ: `docs/architecture/ARCHITECTURE.md`
- プラント差し替えガイド: `docs/guides/PLANT_CUSTOMIZATION.md`
- プラント差し替えガイド（作業フロー順）: `docs/guides/PLANT_CUSTOMIZATION_FLOW.md`
