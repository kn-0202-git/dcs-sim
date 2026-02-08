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
