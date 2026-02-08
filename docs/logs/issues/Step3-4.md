issue: Step3-4 [✅ resolved] プラント差し替えガイドライン文書化
development log: 別プラントのトポロジーやCSVルールに差し替えるための手順ガイドラインを作成。トポロジーデータ作成手順、CSV条件式文法、座標設計ガイド、命名規則、バリデーションの使い方、動作確認チェックリスト、サンプルコードを記載。
technical/architecture reason: Step3-1で実現した疎結合設計の利用手順を文書化し、コード変更なしでの別プラント差し替えを実際に可能にするためのガイドライン。
cautions: ガイドラインはsampleData.tsのnodes/pipes構造に依存するため、データ構造を変更する場合はガイドラインも更新が必要。
troubles: なし
r-issue: なし
edited documents: docs/guides/PLANT_CUSTOMIZATION.md（新規）
next action: なし

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-4.md`)
- [x] Tests written first (Red) — N/A: ドキュメント作成のためテスト対象外
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
