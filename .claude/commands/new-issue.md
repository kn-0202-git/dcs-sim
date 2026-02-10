issue開発ログを作成し、PLAN.md のステータスを更新する。

引数: $ARGUMENTS
（形式: 「StepX-Y タイトル」。省略時は対話で確認）

## 手順
1. 引数をパース（未指定なら対話で確認）
   - 例: `Step4-1 型定義 + データモデル移行` → issue番号 `Step4-1`、タイトル `型定義 + データモデル移行`
2. `docs/process/DEVELOPMENT_PROCESS.md` L60-83 の記録テンプレートを読み取る
3. `docs/logs/issues/StepX-Y.md` を作成（テンプレートをそのまま使用し、issue行のみ埋める）:
   ```
   issue: StepX-Y [🔵 in_progress] タイトル
   development log:
   technical/architecture reason:
   cautions:
   troubles:
   edited documents:
   next action:

   checklist:
   - [ ] Requirements reviewed (updated if needed)
   - [x] Plan issue set to `🔵 in_progress`
   - [x] Issue log created (`docs/logs/issues/StepX-Y.md`)
   - [ ] Tests written first (Red)
   - [ ] Minimal implementation passes tests (Green)
   - [ ] Refactor complete (Refactor)
   - [ ] Tests executed after implementation, results verified
   - [ ] r-issue recorded (or "none")
   - [ ] Plan issue set to `✅ resolved`
   - [ ] Requirements updated if spec changed
   - [ ] Documentation meta updated if docs changed
   - [ ] CLI/feature changes reflected in `README.md` user guide
   ```
4. `docs/process/PLAN.md` で該当issueのステータスを `🟡 open` → `🔵 in_progress` に更新
5. 完了メッセージ: 「issue開発ログ StepX-Y を作成し、PLAN.md を更新しました。」
