r-issue を作成する。

引数: $ARGUMENTS
（形式: 「内容 / 種別(不具合|改善|新要件) / 優先度(高|中|低)」。省略時は対話で確認）

## 手順
1. `docs/logs/r_issues/meta.yaml` を読み、documents リストから次のID（rN）を決定
2. `docs/logs/r_issues/R_ISSUE_LOG_TEMPLATE.md` を読みテンプレート確認
3. 引数をパース（未指定なら対話で確認）
4. `docs/logs/r_issues/r{N}.md` を作成（状態は `🟡 open`）
5. `docs/logs/r_issues/meta.yaml` に `r{N}.md` を追加
6. `docs/process/PLAN.md` §5 に `- rN / 内容 / 種別 / 優先度 / 🟡 open` を追加
7. 完了メッセージ: 「r-issue rN を作成しました。」
