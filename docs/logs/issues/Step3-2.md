# Step3-2: Docker 環境構築

## 概要
Mac/Windows クロスプラットフォーム対応のため Docker 環境を構築。dev（Vite HMR）と prod（静的配信）の2プロファイル。

## 対象ファイル
- `Dockerfile` — マルチステージビルド（dev/prod）
- `docker-compose.yml` — dev + prod プロファイル
- `.dockerignore` — 不要ファイル除外
- `.nvmrc` — Node.js バージョン固定

## 開発ログ

### 技術的判断
1. **マルチステージビルド**: dev ステージは Vite dev server、prod ステージは `serve` で静的配信
2. **HMR対応**: dev では src/ をボリュームマウント + Vite の `--host 0.0.0.0` で外部アクセス許可
3. **.nvmrc**: Docker 外での開発でもバージョン統一

## チェックリスト
- [ ] Dockerfile 作成
- [ ] docker-compose.yml 作成
- [ ] .dockerignore 作成
- [ ] .nvmrc 作成
- [ ] ビルド確認
