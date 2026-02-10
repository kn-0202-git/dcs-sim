issue: Step4-5 [✅ resolved] UI統合（Pipe.valveId除去 + コンポーネント完成）

development log:
- src/types.ts から `Pipe.valveId` プロパティを完全削除（@deprecated マーク解除）
- src/components/PIDCanvas.tsx のバルブ描画ロジックを `pipeToValveMap` ベースに統一
  - `pipes.filter(p => p.valveId !== null)` → `pipeToValveMap.get(pipe.id)` で Valve 取得
  - バルブキーと onClick を valve.id で統一
- src/data/sampleData.ts から pipes 定義の valveId プロパティを削除
- src/data/__tests__/sampleData.test.ts から移行期間テスト（「pipes[].valveId と valves[].pipeId の整合性」2件）を削除
- 全テスト 109 件パス確認（削除したテスト 2 件除いて）
- TypeScript 型エラーなし確認

technical/architecture reason:
- Pipe.valveId は Step4-1 で @deprecated マークされ、Step 4-2〜4-4 で消費者を `pipeToValveMap` に移行済み
- Step4-5 でデータ層（Pipe 型）から完全削除し、実装を完成させる
- UI層（PIDCanvas）の `pipeToValveMap` 参照で、逆導出パターンが全層で統一される
- r17（コンポーネントテスト 14 件失敗）は実装段階で自動的に解消されたことを確認

cautions:
- Pipe.valveId 削除によって古いコードとの互換性は完全に失われたが、Step4-2〜4-4 で既に消費者を移行済み
- sampleData.test.ts での移行期間テスト削除は意図的。pipeToValveMap の整合性は「導出ヘルパー」テストで保証

troubles: なし

edited documents:
- src/types.ts（Pipe.valveId 完全削除）
- src/components/PIDCanvas.tsx（バルブ描画を pipeToValveMap ベースに統一）
- src/data/sampleData.ts（pipes 定義から valveId を削除）
- src/data/__tests__/sampleData.test.ts（移行期間テスト削除）
- docs/process/PLAN.md（Step4-5 ステータス更新）
- docs/logs/issues/Step4-5.md（本ファイル）

next action:
- Step4 の完了確認と r8（バルブ独立化）をクローズ
- ドキュメント確認（README、REQUIREMENTS.md など）が必要なら対応

r-issue:
- r17（Step4 並列作業によるコンポーネントテスト 14 件失敗）：Step4-2〜4-4 で既に自動解消を確認 → クローズ予定

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step4-5.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified — 109 tests passed
- [x] r-issue recorded (or "none") — r17 自動解消確認
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed — 変更なし
- [ ] Documentation meta updated if docs changed — 不要
- [ ] CLI/feature changes reflected in `README.md` user guide — 外部 IF 変更なし
