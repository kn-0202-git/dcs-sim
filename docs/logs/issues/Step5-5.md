issue: Step5-5 [✅ resolved] ドキュメント更新
development log: SVGインポート手順をアプリUI中心の説明に更新し、data属性（data-from/data-to/data-pipe/data-tank-id）と命名ルール、draw.ioでの設定手順を追記。完成時チェックリストもdata属性対応に更新。READMEにSVG読み込みの特徴とガイドへのリンクを追加。
technical/architecture reason: 実装方式（アプリ内アップロード + data属性）に合わせて利用者の手順を最新化し、入力ミスを減らすため。
cautions: data属性が不足すると読み込みエラー/警告になる。input/outlet命名とタンク番号はCSV条件式と一致させる必要がある。
troubles: なし
r-issue: r21 - 開発プロセス標準化（Wチェック/記録品質強化）
verification: `npm run process:check`（パス）
impact: SVG運用手順とプロセス運用手順が統一され、今後の引き継ぎ・レビュー効率が向上。
expert review: topic=利用者向けドキュメントと運用導線 / experts=教育者, UIUX, PM / conclusion=実装済み手順を主軸に文書再編し、迷いを減らす構成を採用 / unresolved=テンプレート例画像の追加は将来対応
edited documents: `docs/guides/PLANT_CUSTOMIZATION.md`, `README.md`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-5.md`, `docs/logs/issues/meta.yaml`, `docs/document_map.yaml`
next action: Step5 完了。必要に応じてSVGテンプレート例の追加。

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-5.md`)
- [ ] Tests written first (Red) (未実施なら `N/A: 理由` を追記) `N/A: ドキュメント改訂issueのため`
- [ ] Minimal implementation passes tests (Green) `N/A: ドキュメント改訂issueのため`
- [ ] Refactor complete (Refactor) (不要なら `N/A: 理由` を追記) `N/A: ドキュメント改訂issueのため`
- [ ] Tests executed after implementation, results verified `N/A: ドキュメント改訂issueのため`
- [x] r-issue recorded (or "none")
- [x] process-check executed locally (`npm run process:check`)
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed (不要なら `N/A: 理由` を追記) `N/A: 要件変更なし`
- [x] Documentation meta updated if docs changed (不要なら `N/A: 理由` を追記)
- [x] CLI/feature changes reflected in `README.md` user guide (不要なら `N/A: 理由` を追記)
