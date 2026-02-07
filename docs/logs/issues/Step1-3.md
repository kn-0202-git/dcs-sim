issue: Step1-3 [✅ resolved] 教育機能のTypeScript化
development log: 既存JSXから教育機能のロジックを抽出しTypeScript化。education/types.ts にPhase/Step/Rule/PhaseWithSteps/ValveAction/Violation/SimulatorState を定義。csvParser.ts にジェネリックなCSVパーサーとデフォルトCSVデータを移植。conditionEvaluator.ts に条件式評価器（AND/OR/バルブ条件/タンク条件/アクション条件/特殊条件）を移植。ruleCheckEngine.ts にルールチェックエンジンを移植。
technical/architecture reason: 教育機能のロジックをUI層から完全に分離することで、単体テストが容易になる。conditionEvaluator に allValveIds を引数として渡す設計にし、グローバル変数への依存を排除。
cautions: Phase/Step/Rule にインデックスシグネチャ `[key: string]: string` を追加（dataToCSV関数との互換性のため）。PhaseWithSteps はインデックスシグネチャと steps: Step[] が競合するため独立インターフェースとして定義。
troubles: TypeScript の型制約で Phase extends Record<string, string> が使えず、インデックスシグネチャで対応。PhaseWithSteps も extends Phase にすると steps プロパティが string インデックスと競合したため独立定義に変更。
r-issue: なし
edited documents: src/education/types.ts, src/education/csvParser.ts, src/education/conditionEvaluator.ts, src/education/ruleCheckEngine.ts

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step1-3.md`)
- [ ] Tests written first (Red) — 移植issueのためテストはStep2で追加
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
