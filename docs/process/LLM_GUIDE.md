# LLM入口

## 1. 役割
- LLM向けの入口として、参照すべきドキュメントを案内する。
- 運用ルールの正本は `docs/process/DEVELOPMENT_PROCESS.md` に置く。

## 2. 参照順
1) `docs/requirements/REQUIREMENTS.md`
2) `docs/process/PLAN.md`
3) `docs/process/DEVELOPMENT_PROCESS.md`
4) `docs/process/EXPERT_PANEL.md`
5) `docs/architecture/ARCHITECTURE.md`

## 3. ファシリテーター運用（必須）
- まずファシリテーターとして、論点・リスク・期限を整理する。
- 必要なときだけ専門家を招集する（常時全員参加しない）。
- 決定事項は issueログの `expert review:` に記録する。

## 4. issue着手時の必須アクション
1. `npm run process:new-issue -- StepX-Y タイトル` を実行
2. 生成された `docs/logs/issues/StepX-Y.md` を起点に実装
3. PLANの該当issueが `🔵 in_progress` になっていることを確認

補足: 手動でテンプレを貼り付ける運用は禁止。必ず共通コマンドを使う。

## 5. r-issue作成時の必須アクション

### トリガー
- ユーザーが「r-issueで」「r-issue作って」と指示したとき
- レビュー後に課題を発見したとき
- 実装中に課題を発見し、記録が必要なとき

### 手順
1. `npm run process:new-r-issue -- "内容" 種別 優先度` を実行
2. 生成された `docs/logs/r_issues/rN.md` を記入
3. PLANの r-issue リストに追記されていることを確認

## 6. 完了前チェック（Wチェック 1stゲート）
- issue完了前に `npm run process:check` を必ず実行
- 失敗した場合はログ/PLAN/metaの不整合を修正して再実行

## 7. 最終チェック（Wチェック 2ndゲート）
- Push/PR時に GitHub Actions の `process-check` が同一ルールで検証
- CI失敗時は成果物として確定しない

## 8. コミットメッセージ規約
- 形式: `<type>(<scope>): <summary> [StepX-Y|rN]`
- type: `feat|fix|refactor|docs|test|chore|ci|perf|sec|process`
- 例: `process(logs): add facilitator review fields [r21]`
