issue: Step4-4 [✅ resolved] バリデータ更新（topologyValidator + テスト）
development log:
- `validateTopology` の第3引数に `Valve[]` を追加
- バルブID重複チェックを `pipes[].valveId` → `valves[]` ベースに移行
- 新規バリデーション追加: `valve.pipeId` が実在パイプを参照しているか検証
- テスト更新: 全呼び出しに `valves` 引数追加、`makeValve` ヘルパー追加、pipeId参照チェックテスト新規追加（計12テスト）
- 呼び出し元（PIDSimulator.tsx）とドキュメント（PLANT_CUSTOMIZATION.md）を新シグネチャに更新

technical/architecture reason:
- バルブの整合性チェックを独立 `Valve[]` から行うことで、`Pipe.valveId`（@deprecated）への依存を排除
- `valve.pipeId` の存在チェックにより、バルブ⇔パイプ間の参照整合性を保証

cautions:
- Step4-5 で `Pipe.valveId` 除去時、テストの `makePipe` から `valveId` 引数を削除する必要あり

troubles: なし

edited documents:
- src/data/topologyValidator.ts（Valve import、シグネチャ変更、バリデーション移行+追加）
- src/data/__tests__/topologyValidator.test.ts（makeValve追加、全呼び出し更新、新規テスト追加）
- src/components/PIDSimulator.tsx（valves import追加、呼び出し更新）
- docs/guides/PLANT_CUSTOMIZATION.md（サンプルコード更新）
- docs/process/PLAN.md（Step4-4 ステータス更新）
- docs/logs/issues/Step4-4.md（本ファイル）

next action: Step4-5（UI統合）

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step4-4.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none") — none
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed — 変更なし
- [ ] Documentation meta updated if docs changed — 不要
- [ ] CLI/feature changes reflected in `README.md` user guide — 外部IF変更なし
