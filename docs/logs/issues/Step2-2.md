issue: Step2-2 [✅ resolved] 教育ロジックテスト（csvParser, conditionEvaluator, ruleCheckEngine）
development log: csvParser(10件)、conditionEvaluator(31件)、ruleCheckEngine(11件)の単体テストを追加。CSVの基本パース・空白トリム・異常系・デフォルトCSVデータ、条件式のバルブ/タンク/特殊/アクション/AND/OR/複合条件、ルールチェックのフェーズフィルター・統合テストをカバー。全52テストパス。
technical/architecture reason: テストファイルは`src/education/__tests__/`にco-locate（Step2-1のlogicと同じ規則）。テストデータはmakeState/makeRule等のヘルパーで最小構成を作成。デフォルトCSVデータとの統合テストも含め、実際のユースケースを検証。
cautions: conditionEvaluatorのAND/OR優先度はANDが先にsplitされる。AND含む式でORも使う場合、各AND部分が再帰的にOR評価される。console.warnのスパイはmockRestoreを忘れないこと。
troubles: なし
r-issue: なし
edited documents: src/education/__tests__/csvParser.test.ts, src/education/__tests__/conditionEvaluator.test.ts, src/education/__tests__/ruleCheckEngine.test.ts

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step2-2.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
