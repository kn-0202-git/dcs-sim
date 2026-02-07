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

## 5. r-issue リスト（課題管理）
運用ルールは `docs/process/DEVELOPMENT_PROCESS.md` を参照

- r1 / issue開発ログの作成漏れ（Step1-1〜1-4） / 改善 / 高 / ✅ resolved

## 6. issue開発ログ（参照）
- 保存先: `docs/logs/issues/`
- 運用とテンプレートは `docs/process/DEVELOPMENT_PROCESS.md` を参照
