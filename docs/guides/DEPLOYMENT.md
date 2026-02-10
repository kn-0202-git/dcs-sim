# デプロイガイド

## 目次

- [1. GitHub Pages](#1-github-pages)
- [2. Docker（ローカル確認用）](#2-dockerローカル確認用)

---

## 1. GitHub Pages

### 概要

`main` ブランチに push すると、GitHub Actions が自動でビルド＆デプロイを行い、
GitHub Pages でアプリが公開される。

**公開 URL**: `https://<username>.github.io/dcs-sim/`

### 初回セットアップ（1回だけ必要）

1. GitHub でリポジトリを開く
2. **Settings** → **Pages** に移動
3. **Source** を **"GitHub Actions"** に変更して保存
4. 初回デプロイをトリガーする（設定変更だけでは既存の main は自動デプロイされない）
   - **方法 A**: Actions タブ → "Deploy to GitHub Pages" → **Run workflow**（手軽）
   - **方法 B**: `main` に何か push する

> これを設定しないと、ワークフローが実行されても Pages が公開されない。

### 自動デプロイの流れ

`main` に push されると `.github/workflows/deploy.yml` が実行される。

```
npm ci → npm test → npm run build → GitHub Pages へアップロード
```

1. 依存パッケージをインストール（`npm ci`）
2. テスト実行（`npm test`）― テスト失敗時はデプロイ中止
3. ビルド（`npm run build`）― `./dist/` フォルダを生成
4. `./dist/` の内容を GitHub Pages にデプロイ

### 関連する設定ファイル

| ファイル | 役割 |
|---|---|
| `.github/workflows/deploy.yml` | GitHub Actions ワークフロー定義 |
| `vite.config.ts` の `base: '/dcs-sim/'` | GitHub Pages のサブパスに対応 |

### デプロイ状況の確認

- GitHub リポジトリの **Actions** タブでワークフローの実行状況を確認できる
- 手動デプロイ: Actions タブ → "Deploy to GitHub Pages" → **Run workflow** でも実行可能（`workflow_dispatch` 対応）

---

## 2. Docker（ローカル確認用）

| 環境 | ポート | コマンド |
|---|---|---|
| dev | 5173 | `docker compose up dev` |
| prod | 3000 | `docker compose up prod` |
