# セットアップガイド

このガイドでは、テンプレートを使って新規プロジェクトを立ち上げる手順を説明します。

## 前提条件

- エディタ（VS Code、Vim、Emacsなど）
- 検索・置換機能が使えること

## 手順

### ステップ1: テンプレートをコピー

```bash
# テンプレートを新しいプロジェクトディレクトリにコピー
cp -r template/ ../my-new-project/
cd ../my-new-project/

# または、別の場所にコピー
cp -r /path/to/template /path/to/my-new-project
cd /path/to/my-new-project
```

### ステップ2: プレースホルダーを定義

まず、プロジェクトの基本情報を決定します：

| プレースホルダー | あなたのプロジェクトの値 |
|---|---|
| `[PROJECT_NAME]` | 例: My Awesome App |
| `[PROJECT_DESCRIPTION]` | 例: A web app for managing tasks |
| `[PROJECT_PURPOSE]` | 例: To improve team productivity |
| `[TARGET_USERS]` | 例: Small teams, Freelancers |
| `[MVP_SCOPE]` | 例: Task creation, basic kanban board |
| `[TECH_LANGUAGE]` | 例: Python / JavaScript / Java |
| `[TECH_STACK]` | 例: React + Node.js + PostgreSQL |
| `[TECH_FRAMEWORK]` | 例: React / Django / Spring Boot |
| `[DOMAIN_ROLE_1]` | 例: UI/UX Designer |
| `[DOMAIN_CONSTRAINT_1]` | 例: Must work offline |

### ステップ3: プレースホルダーを一括置換

#### エディタの検索・置換機能を使う場合

**VS Code:**
1. `Cmd+Shift+H`（Mac）または `Ctrl+Shift+H`（Windows/Linux）
2. 検索ボックスに `[PROJECT_NAME]` を入力
3. 置換ボックスに実際のプロジェクト名を入力
4. 「すべて置換」をクリック
5. 他のプレースホルダーについても同様に繰り返す

#### コマンドラインで一括置換する場合（macOS/Linux）

```bash
# sedで一括置換（macOS）
find . -type f \( -name "*.md" -o -name "*.yaml" \) -exec sed -i '' \
  -e 's/\[PROJECT_NAME\]/My Awesome App/g' \
  -e 's/\[PROJECT_DESCRIPTION\]/A web app for managing tasks/g' \
  -e 's/\[TECH_LANGUAGE\]/JavaScript/g' \
  {} +

# sedで一括置換（Linux）
find . -type f \( -name "*.md" -o -name "*.yaml" \) -exec sed -i \
  -e 's/\[PROJECT_NAME\]/My Awesome App/g' \
  -e 's/\[PROJECT_DESCRIPTION\]/A web app for managing tasks/g' \
  -e 's/\[TECH_LANGUAGE\]/JavaScript/g' \
  {} +
```

### ステップ4: 不要なファイルを削除

#### LLMエントリーポイント

使用しないLLMのファイルを削除：

```bash
# 例: Geminiを使わない場合
rm LLM_ENTRY_POINTS/GEMINI.md

# 例: Claudeのみ使う場合
rm LLM_ENTRY_POINTS/CODEX.md LLM_ENTRY_POINTS/GEMINI.md
```

#### ガイドファイル（オプション）

テンプレートに慣れたら、ガイドファイルを削除できます：

```bash
# 全ガイドファイルを削除（慣れてから）
find . -name "*_GUIDE.md" -delete

# このファイル自体も削除可能
rm SETUP_GUIDE.md PLACEHOLDER_GUIDE.md
```

### ステップ5: LLMエントリーポイントをプロジェクトルートにコピー

```bash
# LLMエントリーポイントをプロジェクトルートにコピー
cp LLM_ENTRY_POINTS/CLAUDE.md ../CLAUDE.md
# または、使用するLLMに応じて
cp LLM_ENTRY_POINTS/CODEX.md ../CODEX.md
cp LLM_ENTRY_POINTS/GEMINI.md ../GEMINI.md

# LLM_ENTRY_POINTSフォルダを削除（オプション）
rm -rf LLM_ENTRY_POINTS/
```

### ステップ6: 言語別セットアップ

#### Python プロジェクトの場合

1. プロジェクトルートで初期化:
   ```bash
   uv init
   uv add pytest  # テストフレームワーク
   # 他の必要なパッケージを追加
   ```

2. `docs/process/DEVELOPMENT_PROCESS.md` を開き、セクション8「検証/運用」に以下を追記:
   ```markdown
   - 依存インストール: `uv sync`
   - 実行: `uv run python main.py`
   - テスト: `uv run python -m unittest discover -s tests`
   ```

#### Node.js/TypeScript プロジェクトの場合

1. プロジェクトルートで初期化:
   ```bash
   npm init -y
   npm install --save-dev jest  # テストフレームワーク
   # 他の必要なパッケージをインストール
   ```

2. `docs/process/DEVELOPMENT_PROCESS.md` を開き、セクション8「検証/運用」に以下を追記:
   ```markdown
   - 依存インストール: `npm install`
   - 実行: `npm run dev`
   - テスト: `npm test`
   ```

#### その他の言語

`docs/process/LANGUAGE_SPECIFIC_RULES.md` を参照して、該当する言語のセクションを確認してください。

### ステップ7: 要件定義書を記入

1. `docs/requirements/REQUIREMENTS.md` を開く
2. 各セクションを順番に記入
   - 背景と目的
   - ステークホルダー/専門家役
   - プロダクト定義
   - ゴール/成功指標
   - スコープ（MVP、フェーズ2以降）
   - 機能要件
   - 非機能要件

ヒント: `docs/requirements/REQUIREMENTS_GUIDE.md`（Phase Bで作成予定）を参照すると書きやすくなります。

### ステップ8: 開発計画を作成

1. `docs/process/PLAN.md` を開く
2. 要件をstep-issueに分解
3. 各step-issueに目的、完了条件、対象issueを記載

### ステップ9: アーキテクチャを記入

1. `docs/architecture/ARCHITECTURE.md` を開く
2. 技術スタック、システム構成、データフローを記載

### ステップ10: メタデータを更新

必要に応じて以下のファイルを更新：

- `docs/document_map.yaml`
- 各フォルダの `meta.yaml`
- ルートの `README.md`

### ステップ11: チェックリスト

新規プロジェクト開始前のチェックリスト:

- [ ] テンプレートをコピーした
- [ ] プレースホルダーを全て置換した
- [ ] 不要なLLMエントリーポイントを削除した
- [ ] LLMエントリーポイントをプロジェクトルートにコピーした
- [ ] 言語別の初期設定を完了した（uv init / npm init等）
- [ ] `docs/requirements/REQUIREMENTS.md` に要件を記入した
- [ ] `docs/process/DEVELOPMENT_PROCESS.md` に実行コマンドを追記した
- [ ] `docs/process/PLAN.md` に最初のstep-issueを記入した
- [ ] `docs/architecture/ARCHITECTURE.md` に技術スタックを記入した
- [ ] メタデータファイル（meta.yaml）を確認した
- [ ] ルートに `README.md` を作成した（プロジェクト概要を記載）

## 次のステップ

セットアップが完了したら：

1. `docs/process/DEVELOPMENT_PROCESS.md` を参照して、最初のissueを作成
2. TDDサイクル（Red → Green → Refactor）で開発開始
3. issue完了後、引き継ぎ文書（`docs/logs/handover/`）を作成

## トラブルシューティング

### プレースホルダーが残っている

全ファイルを検索して残っているプレースホルダーを確認：

```bash
grep -r "\[PROJECT_NAME\]" .
grep -r "\[TECH_LANGUAGE\]" .
```

### メタデータファイルの不整合

`docs/document_map.yaml` と各 `meta.yaml` の内容が一致しているか確認してください。

## サポート

質問や問題がある場合は、プロジェクトのissue管理システムに報告してください。
