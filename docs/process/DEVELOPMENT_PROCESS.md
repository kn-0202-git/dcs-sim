# 開発プロセス

## 1. 目的
- 実装前に進め方を明確化し、TDDで確実に品質を担保する。
- 仕様変更やデータ制約に耐える、反復型の開発手順を採用する。
- 複数LLM/複数プロジェクトでも同一プロセスを再現する。

## 2. 前提
- 要件とアーキテクチャが合意済みである
- ブラウザのみで動作（サーバー不要）

## 3. 役割
- プロダクトマネージャー: スコープ管理・優先度付け
- テックリード: 技術方針と実現性、品質基準
- UX/業務設計: 使い勝手と運用フロー
- プラントオペレーター: バルブ操作の訓練と手順確認
- ファシリテーター: 論点整理、専門家招集、最終意思決定

専門家招集ルールは `docs/process/EXPERT_PANEL.md` を参照。

## 4. 開発フロー（概要）
1) 要件の確定（`docs/requirements/REQUIREMENTS.md`）
2) 開発計画の作成（`docs/process/PLAN.md`）
3) step-issue を issue に分解
4) issueログを先に作成して実装（TDD）
5) 途中課題を r-issue に記録
6) ローカル `process-check` で自己検証（Wチェックの1stゲート）
7) 要件/計画/ドキュメントを更新
8) PR/Push時にGitHub Actionsで最終検証（Wチェックの2ndゲート）

## 4.1 step-issue / issue / r-issue の運用
- step-issue: 機能単位のまとまり。複数issueを内包
- issue: 実装単位。TDDで完結する最小作業単位
- r-issue: 課題管理。レビュー指摘、不具合、改善、新要件を記録

### 運用ルール
- Requirements → Plan → issue → r-issue → Requirements へ反映のループで運用
- step-issue は「機能まとまり」、issue は「実装可能な最小単位」に分解
- issueには必ず開発ログを残し、設計意図・検証結果・影響範囲を記録

### issueのステータス表記（PLAN内）
- 表記: `StepX-Y [ステータス]: 内容`
- 状態: `🟡 open / 🔵 in_progress / ✅ resolved / ⚪ deferred`

### issueログ
- 保存先: `docs/logs/issues/`
- ファイル名: `StepX-Y.md`
- 正本テンプレート: `docs/logs/issues/ISSUE_LOG_TEMPLATE.md`
- 書き方ガイド: `docs/logs/issues/ISSUE_LOG_GUIDE.md`

### r-issueログ
- 保存先: `docs/logs/r_issues/`
- ファイル名: `rN.md`
- 正本テンプレート: `docs/logs/r_issues/R_ISSUE_LOG_TEMPLATE.md`
- 採番: `r1, r2, ...`

### テンプレート運用
- 正本はテンプレートファイルのみ。本文を他ドキュメントへ重複記載しない。
- テンプレート項目が不要な場合は、空欄にせず `N/A: 理由` を明記する。

## 5. TDDの進め方
1) **Red**: 先にテストを書く（API/入出力/境界条件）
2) **Green**: 最小実装でテストを通す
3) **Refactor**: 読みやすさ・拡張性を高める
4) 必要に応じてテスト追加

## 6. 受け入れ基準（Definition of Done）
- 主要テストがパス
- 再現性が確保される（同じ入力で同じ結果）
- issue/r-issueログがテンプレート準拠
- `npm run process:check` がローカルで成功
- GitHub Actions の process-check ジョブが成功

## 7. ブランチ/コミット規約
- 作業は原則 short-lived branch で実施（`feature/*` または `codex/*`）
- コミット形式: `<type>(<scope>): <summary> [StepX-Y|rN]`
- `type`: `feat|fix|refactor|docs|test|chore|ci|perf|sec|process`
- 例: `sec(svg): sanitize upload attributes [Step5-3]`
- コミット本文（推奨）: `why / risk / test`

## 8. Wチェック運用

### 1stゲート（ローカル）
- 開始時: `npm run process:new-issue -- StepX-Y タイトル`
- 課題起票: `npm run process:new-r-issue -- "内容" 種別 優先度`
- 完了前: `npm run process:check`
- 任意: `npm run process:install-hooks` で commit-msg フックを有効化

### 2ndゲート（GitHub Actions）
- `.github/workflows/process-check.yml` で同一チェックを自動実行
- 失敗時は成果物として扱わない（修正後に再実行）

## 9. 検証/運用コマンド
- 依存インストール: `npm install`
- 開発サーバー: `npm run dev`
- テスト: `npm test`
- ビルド: `npm run build`
- プロセス検証: `npm run process:check`
- issueログ作成: `npm run process:new-issue -- StepX-Y タイトル`
- r-issue作成: `npm run process:new-r-issue -- "内容" 種別 優先度`

## 10. 文書改定ルール
- ドキュメントの追加/削除/改名時は以下を更新
  - `docs/document_map.yaml`
  - 対象フォルダの `docs/**/meta.yaml`
  - `README.md` のドキュメント一覧
- CLI/運用コマンドが変わったら `README.md` を必ず更新

## 11. レビュー観点（セルフレビュー）
- SVG更新のレスポンスが十分高速か
- 空タンクで液が正しく遮断されるか
- 外部入力（SVG/CSV）に対する安全性が担保されるか
- 型安全: `any` を使用していないか
- 責務分離が明確か（単一責任）

## 12. 引き継ぎ文書
- 保存先: `docs/logs/handover/HANDOFF_YYYY-MM-DD.md`
- 記載項目: 目的 / 何をやったか / 実行コマンド / 成果物 / 次アクション / LLM / 日付 / 注意点 / 専門家ディスカッション
