# 開発計画（Plan）

## 1. 目的
- 要件をstep-issueとissueに分解し、順序と完了条件を明確にする。

## 2. 運用ルール（参照）
- 運用ルールは `docs/process/DEVELOPMENT_PROCESS.md` を参照

## 3. 既存資産
- `training-simulator-csv.jsx`: 全機能の動作するプロトタイプ。これをTypeScript化・モジュール分割する方針。

## 4. step-issue 一覧
この一覧は `docs/requirements/REQUIREMENTS.md` の内容をissue化したもの。

### Step 1: プロジェクト初期化とTypeScript移行
目的: Vite + React + TypeScript の開発環境を整備し、既存JSXをTypeScriptモジュールに分割する
完了条件: `npm run dev` でシミュレーターが動作し、`npm test` が通る
対象issue:
- Step1-1 [✅ resolved]: Vite + React + TypeScript プロジェクトセットアップ
- Step1-2 [✅ resolved]: 型定義・データ・ロジックのTypeScript化（types, sampleData, computeReachableNodes, isPipeActive）
- Step1-3 [✅ resolved]: 教育機能のTypeScript化（csvParser, conditionEvaluator, ruleCheckEngine）
- Step1-4 [✅ resolved]: UIコンポーネント分割とTypeScript化（PIDSimulator, PIDCanvas, 制御パネル, CSV設定UI）

### Step 2: テスト追加
目的: コアロジックとコンポーネントの品質を担保するテストを追加する
完了条件: 全テストケースがパスする
対象issue:
- Step2-1 [✅ resolved]: コアロジックテスト（computeReachableNodes, isPipeActive）
- Step2-2 [✅ resolved]: 教育ロジックテスト（csvParser, conditionEvaluator, ruleCheckEngine）
- Step2-3 [✅ resolved]: コンポーネントテスト（PIDSimulator統合テスト）

### Step 3: コードレビュー指摘対応 + Docker + 疎結合化 + ガイドライン文書化
目的: シニアエンジニアコードレビューの指摘に対応し、別プラント差し替えを可能にする疎結合設計、Docker環境、ガイドラインを整備する
完了条件: 全テストパス、Docker dev/prod 動作、別トポロジーでコード変更なし動作
対象issue:
- Step3-1 [✅ resolved]: データ層の疎結合化（P0 #1-3 + P1 #4-5）
- Step3-2 [✅ resolved]: Docker 環境構築
- Step3-3 [✅ resolved]: 安全性強化（P1 #6-7 + P2 #10）
- Step3-4 [✅ resolved]: プラント差し替えガイドライン文書化
- Step3-5 [✅ resolved]: 整理・クリーンアップ

## 5. r-issue リスト（課題管理）
運用ルールは `docs/process/DEVELOPMENT_PROCESS.md` を参照

- r1 / issue開発ログの作成漏れ（Step1-1〜1-4） / 改善 / 高 / ✅ resolved
- r2 / Step3 issue開発ログのテンプレート不準拠（Step3-1〜3-5） / 改善 / 高 / ✅ resolved
- r3 / Claude Code許可設定の整備 / 改善 / 中 / 🔵 in_progress
- r4 / プラント差し替えガイドの構成改善（SVG作成ワークフロー + 非IT向けリライト） / 改善 / 中 / ✅ resolved
- r5 / LLMがr-issueを認識・作成できない / 改善 / 高 / ✅ resolved
- r6 / issue開発ログのテンプレート自動生成（Claude Code skill化） / 改善 / 中 / 🟡 open
- r7 / 型名称の統一・ドキュメント改善・tankId 明示化 / 改善 / 高 / ✅ resolved
- r8 / バルブの独立オブジェクト化検討 / 改善 / 中 / 🟡 open
- r9 / GitHub Pages デプロイ / 機能追加 / 中 / ✅ resolved
- r10 / LLMエントリポイントのテンプレート未展開・乖離 / 改善 / 中 / 🟡 open

## 6. issue開発ログ（参照）
- 保存先: `docs/logs/issues/`
- 運用とテンプレートは `docs/process/DEVELOPMENT_PROCESS.md` を参照
