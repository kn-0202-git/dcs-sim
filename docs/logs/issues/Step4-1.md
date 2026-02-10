issue: Step4-1 [✅ resolved] 型定義 + データモデル移行（types.ts, sampleData.ts + テスト）
development log:
- `Valve` インターフェース（id: number, pipeId: string）を types.ts に新規追加
- `Pipe.valveId` に `@deprecated` JSDoc を付与（Step 4-5 で除去予定）
- sampleData.ts に `valves[]` 配列（8件）を手動定義として追加
- 導出ヘルパー `valveMap`（valveId→Valve）、`pipeToValveMap`（pipeId→Valve）を追加
- `allValveIds` の導出元を `pipes[].valveId` → `valves[].id` に変更（値は同一）
- sampleData.test.ts を新規作成（13テスト）

technical/architecture reason:
- バルブを独立オブジェクトにすることで実プラントのデータモデルに近づける（r8）
- `Pipe.valveId` を残し破壊的変更ゼロで移行開始。Steps 4-2〜4-5 で段階的に消費者を移行
- `valveMap` / `pipeToValveMap` は後続ステップでの逆引きに使用予定
- 位置情報はバルブに持たせず PIDCanvas で算出（導出原則に従う）

cautions:
- 移行期間中 `pipes[].valveId` と `valves[].pipeId` が二重定義。整合性テストで保護
- Step 4-5 完了まで `Pipe.valveId` を削除しないこと

troubles: なし

edited documents:
- src/types.ts（Valve 追加、Pipe.valveId @deprecated）
- src/data/sampleData.ts（valves[], valveMap, pipeToValveMap 追加、allValveIds 導出元変更）
- src/data/__tests__/sampleData.test.ts（新規：13テスト）
- docs/process/PLAN.md（Step4-1 ステータス更新）
- docs/logs/issues/Step4-1.md（本ファイル）

next action: Step4-2（BFS更新）、Step4-3（配管判定更新）、Step4-4（バリデータ更新）

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step4-1.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none") — none
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed — 変更なし
- [ ] Documentation meta updated if docs changed — 不要
- [ ] CLI/feature changes reflected in `README.md` user guide — 外部IF変更なし
