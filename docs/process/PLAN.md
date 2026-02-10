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

### Step 4: バルブの独立オブジェクト化（r8）
目的: バルブを Pipe.valveId から独立オブジェクトに分離し、実プラントのデータモデルに近づける
完了条件: 全テストパス、既存機能の動作維持、ドキュメント更新済み
ブランチ: feature/step4-valve-independence（完了後 main にマージ）
対象issue:
- Step4-1 [✅ resolved]: 型定義 + データモデル移行（types.ts, sampleData.ts + テスト）
- Step4-2 [✅ resolved]: BFS更新（computeReachableNodes + テスト）【Phase 2 並列】
- Step4-3 [✅ resolved]: 配管判定更新（isPipeActive + テスト）【Phase 2 並列】
- Step4-4 [✅ resolved]: バリデータ更新（topologyValidator + テスト）【Phase 2 並列】
- Step4-5 [✅ resolved]: UI統合（PIDCanvas, PIDSimulator + コンポーネントテスト）

### Step 5: SVGファイルインポート機能（r19）
目的: アプリ上からSVGファイルを読み込み、draw.ioで作成したP&ID画面を表示・操作可能にする
完了条件: 全テストパス、SVGインポート→表示→バルブ/タンク操作→BFS動作、既存機能の動作維持
ブランチ: feature/step5-svg-import（完了後 main にマージ）
対象issue:
- Step5-1 [✅ resolved]: SVGパーサー + バリデーター（型定義・解析・検証）【Phase 1 並列】
- Step5-2 [✅ resolved]: deriveHelpers 抽出リファクタ【Phase 1 並列】
- Step5-3 [✅ resolved]: SVGCanvas コンポーネント【Phase 2】
- Step5-4 [✅ resolved]: PIDSimulator統合（SVGインポートUI + データソース切替）【Phase 3】
- Step5-5 [🟡 open]: ドキュメント更新【Phase 4】

## 5. r-issue リスト（課題管理）
運用ルールは `docs/process/DEVELOPMENT_PROCESS.md` を参照

- r1 / issue開発ログの作成漏れ（Step1-1〜1-4） / 改善 / 高 / ✅ resolved
- r2 / Step3 issue開発ログのテンプレート不準拠（Step3-1〜3-5） / 改善 / 高 / ✅ resolved
- r3 / Claude Code許可設定の整備 / 改善 / 中 / ✅ resolved
- r4 / プラント差し替えガイドの構成改善（SVG作成ワークフロー + 非IT向けリライト） / 改善 / 中 / ✅ resolved
- r5 / LLMがr-issueを認識・作成できない / 改善 / 高 / ✅ resolved
- r6 / issue開発ログのテンプレート自動生成（Claude Code skill化） / 改善 / 中 / ✅ resolved
- r7 / 型名称の統一・ドキュメント改善・tankId 明示化 / 改善 / 高 / ✅ resolved
- r8 / バルブの独立オブジェクト化検討 / 改善 / 中 / ✅ resolved
- r9 / GitHub Pages デプロイ / 機能追加 / 中 / ✅ resolved
- r10 / LLMエントリポイントのテンプレート未展開・乖離 / 改善 / 中 / ✅ resolved
- r11 / プロジェクトルートの不要ファイル整理 / 改善 / 中 / ✅ resolved
- r12 / 流量表示（配管ごとの流量アニメーション） / 新要件 / 低 / 🟡 open
- r13 / 操作手順記録/再生 / 新要件 / 低 / 🟡 open
- r14 / 複数液種対応（色分け） / 新要件 / 低 / 🟡 open
- r15 / アラーム機能 / 新要件 / 低 / 🟡 open
- r16 / 設定保存/読込 / 新要件 / 低 / 🟡 open
- r17 / Step4並列作業によるコンポーネントテスト14件失敗 / 不具合 / 中 / ✅ resolved
- r18 / brew shellenv の毎回手動実行を不要にする / 改善 / 中 / ✅ resolved
- r19 / SVGファイルインポート機能（アプリ上からSVG読み込み→P&ID画面表示） / 新要件 / 中 / 🔵 in_progress
- r20 / Step5事前コードレビュー: SVGインポートのセキュリティ・運用リスク / 改善 / 高 / 🟡 open

## 6. issue開発ログ（参照）
- 保存先: `docs/logs/issues/`
- 運用とテンプレートは `docs/process/DEVELOPMENT_PROCESS.md` を参照
