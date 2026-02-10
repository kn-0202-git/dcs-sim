issue: Step5-3 [✅ resolved] SVGCanvas コンポーネント
development log: アップロードSVGをそのまま描画し、data属性から配管・バルブ・タンクを拾って色やクリック操作を反映する `SVGCanvas` を実装。配管の通液状態、バルブ開閉色、タンク状態色をDOM操作で更新。基本動作のテスト（配管色、バルブクリック、タンク色）を追加。
technical/architecture reason: draw.ioの座標と形状を維持するため、SVGを直接描画してDOM操作で状態反映する方式が最短かつ再利用性が高い。
cautions: IDは英数字とハイフンのみを前提。`data-pipe`/`data-tank-id` がない要素は操作対象外。グループ要素の場合は子要素に色を適用する。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: r20 - SVGインポートのセキュリティ・運用リスク
verification: `npm test`（全テストパス）
impact: SVGモードで画面描画と操作が可能になり、Step5-4 の統合作業へ進める状態になった。既存PIDCanvasモードには影響なし。
expert review: topic=SVG描画更新の妥当性 / experts=UIUX, シニアエンジニア, セキュリティ / conclusion=DOM操作方式を採用しつつ、安全性強化は r20 で継続 / unresolved=属性サニタイズ強化をStep5-4後続で実施
edited documents: `src/components/SVGCanvas.tsx`, `src/components/__tests__/SVGCanvas.test.tsx`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-3.md`, `docs/logs/issues/meta.yaml`, `docs/document_map.yaml`
next action: Step5-4 - PIDSimulator統合（SVGインポートUI + データソース切替）

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-3.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記) `N/A: 一部の実装が先行したため`
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] process-check executed locally (`npm run process:check`)
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記) `N/A: 要件変更なし`
- [x] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記)
- [ ] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記) `N/A: CLI変更なし`
