issue: Step2-3 [✅ resolved] コンポーネントテスト（PIDSimulator統合テスト）
development log: PIDSimulatorの統合テスト14件を追加。初期レンダリング（タイトル・バルブボタン・モードボタン・フェーズタブ・ステップ指示）、バルブ操作（クリック開閉・2回クリック復帰）、モード切替（自由/訓練）、リセット、訓練フロー（条件達成・次ステップ）、ルール違反（criticalエラー表示・バルブブロック）をカバー。全14テストパス。
technical/architecture reason: @testing-library/reactのrender + screenでDOM検証、userEventでユーザー操作をシミュレーション。SVG内部の描画検証はスキップし、状態変更が正しくUIに反映されるかに焦点。
cautions: 「準備」等のフェーズ名はフェーズタブと右パネルの両方に表示されるため、getAllByTextを使用する必要がある。
troubles: 初回実行時に「準備」テキストの重複でgetByTextが失敗→getAllByTextに修正
r-issue: なし
edited documents: src/components/__tests__/PIDSimulator.test.tsx

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step2-3.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
