issue: Step4-3 [✅ resolved] 配管判定更新（isPipeActive + テスト）
development log: isPipeActive の pipe.valveId 参照を pipeToValveMap 経由に切り替え。シグネチャに pipeToValveMap: ReadonlyMap<string, Valve> を追加。テストも新シグネチャに合わせて更新（makePipe を id ベースに変更、makeValveMap ヘルパー追加）。PIDCanvas に pipeToValveMap prop を追加し、PIDSimulator から渡すよう更新。全111テストパス。
technical/architecture reason: バルブ独立オブジェクト化（r8）の一環。isPipeActive が deprecated な pipe.valveId を参照していたのを、Step4-1 で導入した pipeToValveMap を使うように変更。pipe.valveId への依存を排除し、バルブ情報の解決を外部マップに委譲。
cautions: Step4-5（UI統合）までは PIDCanvas 内のバルブ描画部分（pipes.filter(p => p.valveId !== null)）が pipe.valveId を参照し続ける。
troubles: なし
edited documents: src/logic/isPipeActive.ts, src/logic/__tests__/isPipeActive.test.ts, src/components/PIDCanvas.tsx, src/components/PIDSimulator.tsx
next action: Step4-5（UI統合）で PIDCanvas のバルブ描画を pipeToValveMap 経由に移行

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step4-3.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [ ] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
