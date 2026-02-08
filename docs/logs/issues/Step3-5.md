issue: Step3-5 [✅ resolved] 整理・クリーンアップ（P2 #8, #12）
development log: training-simulator-csv.jsxにdeprecatedコメントを追加。.editorconfigを新規作成（インデント・改行コード統一）。PLAN.mdのStep3全issueを✅ resolvedに更新。PIDSimulator.tsxのスタイル定義がモジュールスコープにあることを確認（変更不要）。全95テストパス、ビルド成功。
technical/architecture reason: プロトタイプファイル（JSX）のdeprecated明示で正式実装（src/のTypeScript）との関係を明確化。.editorconfigでエディタ間の書式統一。
cautions: training-simulator-csv.jsxはdeprecatedだが参照用に残存。削除する場合はREADMEの記載も更新が必要。
troubles: なし
r-issue: なし
edited documents: training-simulator-csv.jsx, .editorconfig（新規）, docs/process/PLAN.md
next action: なし

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-5.md`)
- [x] Tests written first (Red) — N/A: 設定ファイル整理のためテスト対象外
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
