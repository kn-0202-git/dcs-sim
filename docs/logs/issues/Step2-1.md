issue: Step2-1 [✅ resolved] コアロジックテスト（computeReachableNodes, isPipeActive）
development log: BFS到達判定(computeReachableNodes)13件、配管アクティブ判定(isPipeActive)7件の単体テストを追加。全閉・単一パス開通・分岐パス・空タンク遮断・全開全満・source空・境界条件・双方向探索をカバー。全20テストパス。
technical/architecture reason: テストファイルは`src/logic/__tests__/`にco-locate。テストデータはsampleDataと同構造のカスタムデータの両方を使い、ロジックを網羅的に検証。
cautions: computeReachableNodesの空タンク遮断はcurrentNode(起点側)のtype=tankをチェックする。到達先のtankではなく「今いるノードがtankかつ空」で遮断される点に注意。
troubles: なし
r-issue: なし
edited documents: src/logic/__tests__/computeReachableNodes.test.ts, src/logic/__tests__/isPipeActive.test.ts

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step2-1.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
