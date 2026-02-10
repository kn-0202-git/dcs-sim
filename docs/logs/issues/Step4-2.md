issue: Step4-2 [✅ resolved] BFS更新（computeReachableNodes + テスト）
development log:
- `computeReachableNodes` に第5引数 `pipeToValveMap: ReadonlyMap<string, Valve>` を追加
- バルブ判定を `pipe.valveId` → `pipeToValveMap.get(pipe.id)` に変更し、`pipe.valveId` への依存を排除
- テストにヘルパー `buildPipeToValveMap` を追加し、全13テストの呼び出しを新シグネチャに更新
- PIDSimulator.tsx の import に `pipeToValveMap` を追加し、呼び出し引数を更新

technical/architecture reason:
- `pipe.valveId`（@deprecated）に依存せず `pipeToValveMap` を介してバルブを参照する設計に移行
- Map をパラメータとして受け取ることでテスタビリティを維持（テスト側で自由にマップを構築可能）

cautions:
- 移行期間中 `Pipe.valveId` は残存（Step4-5 で除去）
- テストの `buildPipeToValveMap` は `pipe.valveId` から構築しているため、Step4-5 で要更新

troubles: なし

edited documents:
- src/logic/computeReachableNodes.ts（シグネチャ変更 + ロジック変更）
- src/logic/__tests__/computeReachableNodes.test.ts（ヘルパー追加 + 全呼び出し更新）
- src/components/PIDSimulator.tsx（import追加 + 呼び出し引数追加）
- docs/process/PLAN.md（Step4-2 ステータス更新）
- docs/logs/issues/Step4-2.md（本ファイル）

next action: Step4-5（UI統合）で全コンポーネントテストを修復

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step4-2.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none") — none
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed — 変更なし
- [ ] Documentation meta updated if docs changed — 不要
- [ ] CLI/feature changes reflected in `README.md` user guide — 外部IF変更なし
