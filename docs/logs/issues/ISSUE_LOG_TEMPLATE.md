issue: StepX-Y [ステータス] [issueタイトル]
development log: [何を作ったか / 変更点の要約]
technical/architecture reason: [なぜその構成・技術を選んだか]
cautions: [運用や拡張で気をつけること]
troubles: [発生内容 / トラブルシュート / 影響範囲] または「なし」
r-issue: [記録したr-issue] または「なし」
verification: [実行コマンドと結果要約] 例: `npm test` (120 passed)
impact: [利用者/運用/既存機能への影響。なければ「なし」]
expert review: topic=[論点] / experts=[AIエンジニア, セキュリティ など] / conclusion=[結論] / unresolved=[なし or 未解決項目]
edited documents: [変更したファイルの一覧]
next action: [残タスクや関連issue]

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [ ] Issue log created (`docs/logs/issues/StepX-Y.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記)
- [ ] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記)
- [ ] Tests executed after implementation, results verified
- [ ] r-issue recorded (or "none")
- [ ] process-check executed locally (`npm run process:check`)
- [ ] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記)
- [ ] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記)
- [ ] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記)
