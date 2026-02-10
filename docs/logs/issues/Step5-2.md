issue: Step5-2 [✅ resolved] deriveHelpers 抽出リファクタ
development log: `sampleData.ts` で分散していた導出ロジック（valveMap/pipeToValveMap/allValveIds/allTankIds/nodeMap/tankIdMap/initialValves/initialTankFilled）を `deriveHelpers` に集約。既存挙動を保つため、同等の結果を返すテストを追加し、`sampleData.ts` 側は新関数の戻り値を利用する形に変更。
technical/architecture reason: SVGモードでも同じ導出処理を使えるように、データ作成の責務を共通関数へ抽出する方が再利用性と保守性が高い。
cautions: `tankIdMap` は `tankId` が付いた tank のみ対象。`allValveIds` は昇順ソートが前提。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: なし
verification: `npm test`（全テストパス）
impact: 既存動作を維持したまま、Step5-4 のデータソース切替で再利用できる導出APIを確立。保守性とテスト容易性が向上。
expert review: topic=導出ロジックの再利用性 / experts=AIエンジニア, シニアエンジニア / conclusion=sampleData依存を減らし、共通ヘルパーへ抽出する方針を採用 / unresolved=なし
edited documents: `src/data/deriveHelpers.ts`, `src/data/sampleData.ts`, `src/data/__tests__/deriveHelpers.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-2.md`
next action: Step5-3 - SVGCanvas コンポーネント実装

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-2.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記) `N/A: 一部の実装が先行したため`
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] process-check executed locally (`npm run process:check`)
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記) `N/A: 要件変更なし`
- [ ] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記) `N/A: ドキュメント構成変更なし`
- [ ] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記) `N/A: 利用者向けCLI変更なし`
