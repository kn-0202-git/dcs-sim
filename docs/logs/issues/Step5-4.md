issue: Step5-4 [✅ resolved] PIDSimulator統合（SVGインポートUI + データソース切替）
development log: SVGファイルを読み込むUI（ファイル選択・適用/切替）を追加し、SVGトポロジー構築関数（parse → validate → nodes/pipes/valves生成）を実装。PIDSimulatorでデータソースを標準/SVGで切替できるようにし、SVGモードでは `SVGCanvas` を使用。読み込みエラー/警告を表示するパネルを追加。トポロジー生成のテストを追加。
technical/architecture reason: SVG解析/検証/マッピングを `buildSvgTopology` に集約して再利用可能にし、PIDSimulatorは「データソース選択」と「状態管理」に専念させた。
cautions: input/outlet は `input`/`input-番号`, `outlet`/`outlet-番号` のID命名に依存。inputが無いと到達判定が動かない。CSVのV/T番号はSVG側のバルブ/タンク番号と一致させる必要がある。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: r20 - SVGインポートのセキュリティ・運用リスク
verification: `npm test`（全テストパス）
impact: アプリ上でSVG取込から運転操作まで一連動作が可能になった。別プラント差し替えの運用負荷を低減。
expert review: topic=SVG統合時の設計整合 / experts=AIエンジニア, シニアエンジニア, PM / conclusion=データソース切替を PIDSimulator に集中し、SVGロジックは `svgTopology` へ分離 / unresolved=サニタイズ強化・制限値調整はr20継続
edited documents: `src/svg/svgTopology.ts`, `src/svg/__tests__/svgTopology.test.ts`, `src/components/PIDSimulator.tsx`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-4.md`, `docs/logs/issues/meta.yaml`, `docs/document_map.yaml`
next action: Step5-5 - ドキュメント更新

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-4.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記) `N/A: 一部の実装が先行したため`
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] process-check executed locally (`npm run process:check`)
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記) `N/A: 既存要件の範囲内`
- [x] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記)
- [ ] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記) `N/A: CLI変更なし`
