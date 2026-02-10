issue: Step5-4 [✅ resolved] PIDSimulator統合（SVGインポートUI + データソース切替）
development log: SVGファイルを読み込むUI（ファイル選択・適用/切替）を追加し、SVGトポロジー構築関数（parse → validate → nodes/pipes/valves生成）を実装。PIDSimulatorでデータソースを標準/ SVG で切替できるようにし、SVGモードでは `SVGCanvas` を使用。読み込みエラー/警告を表示するパネルを追加。トポロジー生成のテストを追加。
technical/architecture reason: SVG解析/検証/マッピングを `buildSvgTopology` に集約して再利用可能にし、PIDSimulatorは「データソース選択」と「状態管理」に専念させた。
cautions: input/outlet は `input`/`input-番号`, `outlet`/`outlet-番号` のID命名に依存。inputが無いと到達判定が動かない。CSVのV/T番号はSVG側のバルブ/タンク番号と一致させる必要がある。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: なし
edited documents: `src/svg/svgTopology.ts`, `src/svg/__tests__/svgTopology.test.ts`, `src/components/PIDSimulator.tsx`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-4.md`, `docs/logs/issues/meta.yaml`, `docs/document_map.yaml`
next action: Step5-5 - ドキュメント更新

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-4.md`)
- [ ] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
