issue: Step5-2 [✅ resolved] deriveHelpers 抽出リファクタ
development log: `sampleData.ts` で分散していた導出ロジック（valveMap/pipeToValveMap/allValveIds/allTankIds/nodeMap/tankIdMap/initialValves/initialTankFilled）を `deriveHelpers` に集約。既存挙動を保つため、同等の結果を返すテストを追加し、`sampleData.ts` 側は新関数の戻り値を利用する形に変更。
technical/architecture reason: SVGモードでも同じ導出処理を使えるように、データ作成の責務を共通関数へ抽出する方が再利用性と保守性が高い。
cautions: `tankIdMap` は `tankId` が付いた tank のみ対象。`allValveIds` は昇順ソートが前提。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: なし
edited documents: `src/data/deriveHelpers.ts`, `src/data/sampleData.ts`, `src/data/__tests__/deriveHelpers.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-2.md`
next action: Step5-3 - SVGCanvas コンポーネント実装

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-2.md`)
- [ ] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [ ] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
