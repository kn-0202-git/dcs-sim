issue: Step1-4 [✅ resolved] UIコンポーネント分割とTypeScript化
development log: 既存JSXの巨大な単一コンポーネントを3つのTypeScriptコンポーネントに分割。PIDCanvas.tsx にSVG描画（配管・バルブ・タンク・接続点）を分離。CSVEditorPanel.tsx にCSV設定モーダル（編集・適用・インポート・コピー・バリデーション）を分離。PIDSimulator.tsx にメインの状態管理とUI（フェーズ進行・バルブ制御・エラー表示・ログ）を集約。App.tsx を PIDSimulator の呼び出しのみに簡略化。不要なデフォルトファイル（App.css, react.svg）を削除。index.css を最小リセットに変更。`npm run build` で成功確認。
technical/architecture reason: 単一ファイル727行のJSXを責務ごとに分割し、保守性とテスタビリティを向上。PIDCanvas は純粋な描画コンポーネント（propsのみに依存）。CSVEditorPanel はCSV編集の自己完結的なモーダル。PIDSimulator が全状態を管理する。
cautions: PIDCanvas の fill 変数に `let fill: string` と明示的型注釈が必要（COLORS定数のリテラル型推論との競合を回避）。
troubles: なし
r-issue: なし
edited documents: src/App.tsx, src/index.css, src/components/PIDSimulator.tsx, src/components/PIDCanvas.tsx, src/components/CSVEditorPanel.tsx
next action: Step2-1〜2-3 テスト追加

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step1-4.md`)
- [ ] Tests written first (Red) — 移植issueのためテストはStep2で追加
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
