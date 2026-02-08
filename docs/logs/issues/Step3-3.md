issue: Step3-3 [✅ resolved] 安全性強化（P1 #6-7 + P2 #10）
development log: conditionEvaluatorの未知条件の戻り値を`true`→`false`に変更（fail-safe原則）。CSVEditorPanelのバリデーションを先頭行のみ→全行チェックに拡張。PIDSimulatorのcheckRules呼び出しにtry-catch追加（エラー時はコンソール警告）。既存テスト1件の期待値を更新。全95テストパス。
technical/architecture reason: fail-safe原則に基づき、未知の条件式は`false`を返すことでCSV設定ミスを早期発見する。CSVバリデーションは全行チェックでデータ品質を担保。try-catchはユーザー操作を中断させないための防御的プログラミング。
cautions: 未知条件が`false`を返すようになったため、CSV設定で不正な条件式を書くとステップ完了判定が進まなくなる（意図的な安全側設計）。
troubles: なし
r-issue: なし
edited documents: src/education/conditionEvaluator.ts, src/components/CSVEditorPanel.tsx, src/components/PIDSimulator.tsx, src/education/__tests__/conditionEvaluator.test.ts
next action: なし

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-3.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
