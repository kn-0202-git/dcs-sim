issue: Step5-1 [✅ resolved] SVGパーサー + バリデーター（型定義・解析・検証）
development log: SVGテキストをDOMParserで解析し、data属性（data-from/data-to/data-pipe/data-tank-id）から pipes/valves/tanks を抽出するパーサーを実装。検証ではID重複、必須属性の欠落、存在しないパイプ参照、タンク番号の不正/重複などを検出。配管で参照されていないタンクは警告に分類。パーサー/バリデーターのテストを追加。
technical/architecture reason: draw.ioのSVGをそのまま読み込む方針のため、SVG文字列を安全にDOM解析し、data属性に最小限のトポロジー情報を持たせる構成が最も簡潔。バリデーションを分離して、SVG入力ミスを早期に検出できるようにした。
cautions: バルブIDは要素idの末尾数字（例: valve-1）から取得する前提。data属性が不足すると解析/検証でエラーになる。SVGの見た目や座標は検証対象外。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: なし
edited documents: `src/svg/types.ts`, `src/svg/svgParser.ts`, `src/svg/svgValidator.ts`, `src/svg/__tests__/svgParser.test.ts`, `src/svg/__tests__/svgValidator.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-1.md`
next action: Step5-3 - SVGCanvas コンポーネント実装

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-1.md`)
- [ ] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [ ] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
