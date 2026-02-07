# プレースホルダーガイド

このドキュメントでは、テンプレート内で使用されているすべてのプレースホルダーと、その置換方法を説明します。

## プレースホルダー命名規則

- **形式**: `[CATEGORY_ITEM]` または `[ITEM]`
- **大文字・アンダースコア**で統一
- **カテゴリ**: PROJECT, TECH, DOMAIN, TEAM, META

## プレースホルダー一覧

### プロジェクト関連

| プレースホルダー | 説明 | 使用例 | 使用ファイル |
|---|---|---|---|
| `[PROJECT_NAME]` | プロジェクト名 | My Awesome App | REQUIREMENTS.md, ARCHITECTURE.md |
| `[PROJECT_DESCRIPTION]` | プロジェクト概要（1行） | A web app for managing tasks | REQUIREMENTS.md |
| `[PROJECT_PURPOSE]` | プロジェクトの目的 | To improve team productivity | REQUIREMENTS.md |

### 対象ユーザー・スコープ

| プレースホルダー | 説明 | 使用例 | 使用ファイル |
|---|---|---|---|
| `[TARGET_USERS]` | 対象ユーザー | Small teams, Freelancers | REQUIREMENTS.md |
| `[MVP_SCOPE]` | MVPスコープ | Task creation, basic kanban | REQUIREMENTS.md |

### 技術スタック関連

| プレースホルダー | 説明 | 使用例 | 使用ファイル |
|---|---|---|---|
| `[TECH_LANGUAGE]` | 主要言語 | Python / JavaScript / Java | REQUIREMENTS.md, ARCHITECTURE.md |
| `[TECH_STACK]` | 技術スタック | React + Node.js + PostgreSQL | REQUIREMENTS.md, ARCHITECTURE.md |
| `[TECH_FRAMEWORK]` | フレームワーク | React / Django / Spring Boot | ARCHITECTURE.md |

### ドメイン固有

| プレースホルダー | 説明 | 使用例 | 使用ファイル |
|---|---|---|---|
| `[DOMAIN_ROLE_1]` | ドメイン固有役割1 | UI/UX Designer | REQUIREMENTS.md, DEVELOPMENT_PROCESS.md |
| `[DOMAIN_CONSTRAINT_1]` | ドメイン固有制約1 | Must work offline | DEVELOPMENT_PROCESS.md |

## 置換方法

### 方法1: エディタの検索・置換機能

#### VS Code

1. プロジェクトフォルダを開く
2. `Cmd+Shift+H`（Mac）または `Ctrl+Shift+H`（Windows/Linux）で検索・置換パネルを開く
3. 検索ボックスにプレースホルダー（例: `[PROJECT_NAME]`）を入力
4. 置換ボックスに実際の値（例: `My Awesome App`）を入力
5. 「すべて置換」をクリック

#### Vim

```vim
:%s/\[PROJECT_NAME\]/My Awesome App/g
:%s/\[TECH_LANGUAGE\]/Python/g
```

### 方法2: コマンドライン（一括置換）

#### macOS

```bash
#!/bin/bash

# プロジェクト情報を定義
PROJECT_NAME="My Awesome App"
PROJECT_DESCRIPTION="A web app for managing tasks"
PROJECT_PURPOSE="To improve team productivity"
TARGET_USERS="Small teams, Freelancers"
MVP_SCOPE="Task creation, basic kanban board"
TECH_LANGUAGE="JavaScript"
TECH_STACK="React + Node.js + PostgreSQL"
TECH_FRAMEWORK="React"
DOMAIN_ROLE_1="UI/UX Designer"
DOMAIN_CONSTRAINT_1="Must work offline"

# 一括置換
find . -type f \( -name "*.md" -o -name "*.yaml" \) -exec sed -i '' \
  -e "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" \
  -e "s/\[PROJECT_DESCRIPTION\]/$PROJECT_DESCRIPTION/g" \
  -e "s/\[PROJECT_PURPOSE\]/$PROJECT_PURPOSE/g" \
  -e "s/\[TARGET_USERS\]/$TARGET_USERS/g" \
  -e "s/\[MVP_SCOPE\]/$MVP_SCOPE/g" \
  -e "s/\[TECH_LANGUAGE\]/$TECH_LANGUAGE/g" \
  -e "s/\[TECH_STACK\]/$TECH_STACK/g" \
  -e "s/\[TECH_FRAMEWORK\]/$TECH_FRAMEWORK/g" \
  -e "s/\[DOMAIN_ROLE_1\]/$DOMAIN_ROLE_1/g" \
  -e "s/\[DOMAIN_CONSTRAINT_1\]/$DOMAIN_CONSTRAINT_1/g" \
  {} +

echo "プレースホルダーの置換が完了しました"
```

#### Linux

```bash
#!/bin/bash

# プロジェクト情報を定義
PROJECT_NAME="My Awesome App"
PROJECT_DESCRIPTION="A web app for managing tasks"
# ... （他の変数も同様に定義）

# 一括置換（Linuxでは -i '' ではなく -i を使用）
find . -type f \( -name "*.md" -o -name "*.yaml" \) -exec sed -i \
  -e "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" \
  -e "s/\[PROJECT_DESCRIPTION\]/$PROJECT_DESCRIPTION/g" \
  # ... （他のプレースホルダーも同様）
  {} +
```

### 方法3: スクリプトファイルを使用

上記のコマンドを `setup.sh` として保存し、実行可能にします：

```bash
chmod +x setup.sh
./setup.sh
```

## 置換後の確認

置換が正しく完了したか確認：

```bash
# 残っているプレースホルダーを検索
grep -r "\[PROJECT_NAME\]" . 2>/dev/null
grep -r "\[TECH_LANGUAGE\]" . 2>/dev/null

# 全プレースホルダーを一括検索
grep -r "\[.*\]" . --include="*.md" --include="*.yaml" | grep -v "例:" | grep -v "使用例"
```

出力がなければ、すべてのプレースホルダーが正しく置換されています。

## 追加のプレースホルダー

プロジェクト固有の追加プレースホルダーが必要な場合：

1. 同じ命名規則（`[CATEGORY_ITEM]`）に従う
2. このガイドに追加して記録する
3. チーム全体で共有する

### 例: 追加のドメイン固有役割

```markdown
| `[DOMAIN_ROLE_2]` | ドメイン固有役割2 | Security Expert | REQUIREMENTS.md |
| `[DOMAIN_ROLE_3]` | ドメイン固有役割3 | Data Scientist | REQUIREMENTS.md |
```

## トラブルシューティング

### 置換が一部のファイルで失敗する

特殊文字（`/`, `&`, `\`）を含む値を置換する場合、エスケープが必要です：

```bash
# 特殊文字を含む場合はエスケープ
sed -i '' 's/\[TECH_STACK\]/React \& Node.js/g' file.md
```

### プレースホルダーが意図しない場所で置換される

プレースホルダー形式を厳密に守ることで回避できます。例：

- 良い例: `[PROJECT_NAME]`
- 悪い例: `[project name]`、`[ProjectName]`

## まとめ

1. プロジェクト情報を決定
2. プレースホルダーを一括置換（エディタまたはスクリプト）
3. 置換結果を確認
4. 開発開始

次は `SETUP_GUIDE.md` を参照して、テンプレートのセットアップを完了させてください。
