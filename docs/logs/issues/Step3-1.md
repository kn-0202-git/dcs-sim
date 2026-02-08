issue: Step3-1 [✅ resolved] データ層の疎結合化（P0 #1-3 + P1 #4-5）
development log: sampleData.tsのallValveIds/allTankIds/nodeMap/initialTankFilled/initialValvesをnodes/pipesから自動導出に変更。tankIdMap（CSV条件短縮名→ノードIDマッピング）を追加。conditionEvaluator/ruleCheckEngineにtankIdMapパラメータ追加。PIDCanvasのキャンバスサイズをノード座標から自動算出。topologyValidator新規作成（ノード/パイプ/バルブID整合性チェック、devモード実行）。テスト9件追加。全95テストパス。
technical/architecture reason: トポロジーデータと教育ロジック間の暗黙的な結合を排除し、別プラントへの差し替えをコード変更なしで可能にする設計。nodes/pipesのみ手動定義し、残りは自動導出することで手動同期のリスクを排除。tankIdMapはCSV条件式の`T1`→ノードID`tank-T1`の変換を明示化し、nodes配列のタンク出現順で番号付け。
cautions: 既存テスト86件へのAPI後方互換性を維持（conditionEvaluatorのtankIdMapはoptionalパラメータ、デフォルトは従来の`tank-T${n}`フォールバック）。tankIdMapのタンク番号はnodes配列のタンク出現順（T1=最初のtank、T2=2番目のtank）。
troubles: なし
r-issue: なし
edited documents: src/data/sampleData.ts, src/data/topologyValidator.ts（新規）, src/data/__tests__/topologyValidator.test.ts（新規）, src/education/conditionEvaluator.ts, src/education/ruleCheckEngine.ts, src/components/PIDCanvas.tsx, src/components/PIDSimulator.tsx
next action: なし

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-1.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
