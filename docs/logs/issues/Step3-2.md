issue: Step3-2 [✅ resolved] Docker 環境構築
development log: Mac/Windowsクロスプラットフォーム対応のためDocker環境を構築。マルチステージビルド（dev/build/prod）のDockerfile、dev（Vite HMR, port 5173）+ prod（serve, port 3000）のdocker-compose.yml、.dockerignore、.nvmrc（Node 22固定）を作成。
technical/architecture reason: devステージはVite dev serverでHMR対応（src/をボリュームマウント + `--host 0.0.0.0`で外部アクセス許可）。prodステージは`serve`で静的配信。.nvmrcでDocker外の開発でもバージョン統一。
cautions: DockerイメージはLTS安定運用のためnode:22-slimを使用（ローカル開発はNode 25）。devプロファイルではsrc/をマウントするためホスト側のファイル変更がリアルタイム反映される。
troubles: なし
r-issue: なし
edited documents: Dockerfile（新規）, docker-compose.yml（新規）, .dockerignore（新規）, .nvmrc（新規）
next action: なし

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-2.md`)
- [x] Tests written first (Red) — N/A: Docker設定のためテスト対象外
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
