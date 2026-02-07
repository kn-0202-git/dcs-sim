issue: Step1-1 [✅ resolved] Vite + React + TypeScript プロジェクトセットアップ
development log: Vite + React + TypeScript テンプレートでプロジェクトをスキャフォールド。Vitest + @testing-library/react をテスト環境として追加。vite.config.ts にテスト設定（jsdom環境、globals有効）を追加。package.json に test/test:watch スクリプトを追加。
technical/architecture reason: Vite は高速なHMRとビルドを提供し、React+TypeScript テンプレートが公式サポートされているため選択。Vitest は Vite と同じ設定を共有でき、追加設定が最小限で済む。
cautions: Node.js は Homebrew 経由でインストール（`eval "$(/opt/homebrew/bin/brew shellenv)"` が必要）。既存ファイルがあったため一時ディレクトリでスキャフォールドしてからコピーした。
troubles: なし
r-issue: なし
edited documents: package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, index.html, src/test/setup.ts, src/main.tsx, src/index.css, .gitignore

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step1-1.md`)
- [ ] Tests written first (Red) — セットアップissueのためテスト対象なし
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
