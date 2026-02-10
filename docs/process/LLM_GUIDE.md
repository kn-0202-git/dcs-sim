# LLM入口

## 1. 役割
- LLM向けの入口として、参照すべきドキュメントを案内する。
- 運用ルールの正本は `docs/process/DEVELOPMENT_PROCESS.md` に置く。

## 2. 参照順
1) `docs/requirements/REQUIREMENTS.md`
2) `docs/process/PLAN.md`
3) `docs/process/DEVELOPMENT_PROCESS.md`
4) `docs/architecture/ARCHITECTURE.md`

## 3. issue着手時の必須アクション
issueに着手する際は、**コードを書く前に**以下を必ず実行する:
1. `docs/logs/issues/StepX-Y.md` を作成し、`docs/process/DEVELOPMENT_PROCESS.md` の記録テンプレート（L60-83）をそのまま貼り付ける
2. `PLAN.md` のissueステータスを `🔵 in_progress` に更新する

ログファイルの作成がissue開始の証跡となる。事後作成では記録の正確性が低下する（r1参照）。
テンプレートを独自フォーマットに変えず、そのままの形式で使うこと（r2参照）。

## 4. r-issue作成時の必須アクション

r-issueはレビュー指摘・不具合・改善・新要件を記録する仕組み。

### トリガー
- ユーザーが「r-issueで」「r-issue作って」等と指示 → 即作成
- レビュー後に課題発見 → 即作成
- その他のタイミングで課題発見 → 「r-issueとして記録しますか？」と確認

### 作成手順
1. `docs/logs/r_issues/meta.yaml` から次のID（r1,r2,...の連番）を決定
2. `docs/logs/r_issues/r{N}.md` を作成（テンプレート: `docs/logs/r_issues/R_ISSUE_LOG_TEMPLATE.md`）
3. `docs/logs/r_issues/meta.yaml` の documents に `r{N}.md` を追加
4. `docs/process/PLAN.md` §5 に r-issue エントリを追加

詳細は `docs/process/DEVELOPMENT_PROCESS.md` §4.1 r-issueの運用ルール（L85-91）を参照。
