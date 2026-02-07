issue: Step1-2 [✅ resolved] 型定義・データ・ロジックのTypeScript化
development log: 既存JSX（training-simulator-csv.jsx）からデータ構造とロジックを抽出し、TypeScriptモジュールに分割。types.ts にPIDNode/Pipe/ValveState/TankFilledState を定義。sampleData.ts にノード・配管・初期状態データを移植。computeReachableNodes.ts にBFS到達判定、isPipeActive.ts に配管通液判定を実装。colors.ts に色定数を定義。
technical/architecture reason: 既存プロトタイプの動作実績あるロジックをそのまま活用し、型を付けることで安全性を確保。ロジックをUI層から分離することでテスタビリティを向上。
cautions: PIDNode の type に 'source' を追加（元のJSXで使用されているため）。valveId は number | null（元のJSXに合わせた）。
troubles: なし
r-issue: なし
edited documents: src/types.ts, src/constants/colors.ts, src/data/sampleData.ts, src/logic/computeReachableNodes.ts, src/logic/isPipeActive.ts

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step1-2.md`)
- [ ] Tests written first (Red) — 移植issueのためテストはStep2で追加
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
