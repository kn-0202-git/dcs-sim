issue: Step5-5 [✅ resolved] ドキュメント更新
development log: SVGインポート手順をアプリUI中心の説明に更新し、data属性（data-from/data-to/data-pipe/data-tank-id）と命名ルール、draw.ioでの設定手順を追記。完成時チェックリストもdata属性対応に更新。READMEにSVG読み込みの特徴とガイドへのリンクを追加。
technical/architecture reason: 実装方式（アプリ内アップロード + data属性）に合わせて利用者の手順を最新化し、入力ミスを減らすため。
cautions: data属性が不足すると読み込みエラー/警告になる。input/outlet命名とタンク番号はCSV条件式と一致させる必要がある。
troubles: なし
r-issue: なし
edited documents: `docs/guides/PLANT_CUSTOMIZATION.md`, `README.md`, `docs/process/PLAN.md`, `docs/logs/issues/Step5-5.md`, `docs/logs/issues/meta.yaml`, `docs/document_map.yaml`
next action: Step5 完了。必要に応じてSVGテンプレート例の追加。

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step5-5.md`)
- [ ] Tests written first (Red)
- [ ] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor)
- [ ] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
