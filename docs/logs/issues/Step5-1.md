issue: Step5-1 [✅ resolved] SVGパーサー + バリデーター（型定義・解析・検証）
development log: SVGテキストをDOMParserで解析し、data属性（data-from/data-to/data-pipe/data-tank-id）から pipes/valves/tanks を抽出するパーサーを実装。検証ではID重複、必須属性の欠落、存在しないパイプ参照、タンク番号の不正/重複などを検出。配管で参照されていないタンクは警告に分類。パーサー/バリデーターのテストを追加。
technical/architecture reason: draw.ioのSVGをそのまま読み込む方針のため、SVG文字列を安全にDOM解析し、data属性に最小限のトポロジー情報を持たせる構成が最も簡潔。バリデーションを分離して、SVG入力ミスを早期に検出できるようにした。
cautions: バルブIDは要素idの末尾数字（例: valve-1）から取得する前提。data属性が不足すると解析/検証でエラーになる。SVGの見た目や座標は検証対象外。
troubles: TDDの順序（Red→Green）を厳密に守れず、一部の実装が先行した。
r-issue: r20 - SVGインポートのセキュリティ・運用リスク
verification: `npm test`（全テストパス）
impact: SVGデータの構造化と入力検証が可能になり、Step5-3/5-4 の実装前提が整った。既存の sampleData モードへの影響はなし。
expert review: topic=SVG入力の妥当性と安全性 / experts=シニアエンジニア, セキュリティ / conclusion=構造検証を先行実装し、サニタイズ強化は r20 で継続 / unresolved=r20 の対策をStep5-3/5-4で反映
edited documents: `src/svg/types.ts`, `src/svg/svgParser.ts`, `src/svg/svgValidator.ts`, `src/svg/__tests__/svgParser.test.ts`, `src/svg/__tests__/svgValidator.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-1.md`
next action: Step5-3 - SVGCanvas コンポーネント実装

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-1.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記) `N/A: 一部の実装が先行したため`
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] process-check executed locally (`npm run process:check`)
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記) `N/A: 仕様追加はPLAN管理で対応済み`
- [ ] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記) `N/A: 既存ドキュメント構成変更なし`
- [ ] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記) `N/A: 利用者向けCLI変更なし`
