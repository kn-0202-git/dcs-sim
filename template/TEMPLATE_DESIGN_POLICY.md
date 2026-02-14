# テンプレート設計方針書

このドキュメントは、汎用プロジェクトテンプレートの設計方針と作成経緯を記録する。
テンプレートを改修・拡張する際は、この方針を確認してから作業すること。

## 1. 背景と目的

### 背景
dcs-simプロジェクト（投資ヘルプツール）の開発で整備されたドキュメント構造には、以下の優れた仕組みが含まれていた：

- LLM向けエントリーポイント（CLAUDE.md等）
- 体系的なドキュメント（要件定義、開発プロセス、計画、アーキテクチャ）
- issue / r-issue 管理の仕組み
- 引き継ぎ文書フォーマット
- メタデータ管理（document_map.yaml、meta.yaml）

しかし、この構造は投資ヘルプツール固有の内容を含んでおり、他のプロジェクトで再利用するには汎用化が必要だった。

### 目的
- 現在のドキュメント構造を **汎用的なテンプレート** として `template/` フォルダに作成する
- **言語非依存** にしつつ、言語別ルールを明記する
- 新規プロジェクト開始時に **コピー・カスタマイズが簡単** にできるようにする

## 2. 設計原則

### 2.1 汎用性とシンプルさのバランス
- プレースホルダーは **必要最小限** に抑える（増やしすぎない）
- テンプレート本体はシンプルに、詳細は `*_GUIDE.md` で補完する
- サンプル・具体例を適度に残し、何を書くべきか分かるようにする

### 2.2 プレースホルダー方式
- 全て `[UPPERCASE_FORMAT]` 形式（例: `[PROJECT_NAME]`）
- エディタの検索・置換で一括置換できる
- カテゴリ: PROJECT、TECH、DOMAIN の3系統

### 2.3 ガイド分離
- テンプレートファイル（実際に使うファイル）と書き方ガイドを分離する
- ガイドは不要になったら削除できる
- テンプレート自体の可読性を保つ

### 2.4 言語非依存
- コアプロセス（TDD、issue運用、引き継ぎ）は言語に依存しない
- 言語固有のルール（パッケージ管理、テストフレームワーク等）は `LANGUAGE_SPECIFIC_RULES.md` に集約する
- 対応言語: Python、Node.js/TypeScript、Java、Go、Rust（拡張可能）

### 2.5 TDD指向
- Red → Green → Refactor サイクルを開発プロセスに組み込む
- issueごとにテストの作成を必須とする

### 2.6 LLM対応
- Claude、Codex、Gemini等のLLM向けエントリーポイントを用意する
- LLMが参照すべきドキュメントの順序を `LLM_GUIDE.md` で定義する
- 参照順序: REQUIREMENTS → PLAN → DEVELOPMENT_PROCESS → ARCHITECTURE

### 2.7 3層issue管理
- **step-issue**: 機能単位のまとまり
- **issue**: TDDで完結する最小の作業単位
- **r-issue**: 課題管理（不具合、改善、新要件）
- Requirements → Plan → issue → r-issue → Requirements の循環で運用する

## 3. ディレクトリ構造の設計根拠

```
template/
├── README.md                    # テンプレートの概要・クイックスタート
├── SETUP_GUIDE.md               # 新規プロジェクト立ち上げの詳細手順
├── PLACEHOLDER_GUIDE.md         # プレースホルダー一覧と置換方法
├── TEMPLATE_DESIGN_POLICY.md    # このファイル（設計方針）
├── LLM_ENTRY_POINTS/            # LLMエントリーポイント（プロジェクトルートにコピーして使う）
└── docs/                        # ドキュメントルート
    ├── document_map.yaml        # 全ドキュメントのマップ（一覧管理）
    ├── meta.yaml                # ルートメタデータ
    ├── requirements/            # 要件定義（何を作るか）
    ├── process/                 # 開発プロセス・計画（どう作るか）
    ├── architecture/            # アーキテクチャ（技術的にどう実現するか）
    └── logs/                    # 全ログ（時系列の記録）
        ├── issues/              # issue開発ログ
        ├── r_issues/            # r-issue課題ログ
        └── handover/            # 引き継ぎ文書
```

### フォルダ分割の基準
- **requirements / process / architecture**: 「何を」「どう」「技術的にどう」で三分割
- **logs**: 時系列の記録（issue、r-issue、引き継ぎ）を一箇所に集約
- **LLM_ENTRY_POINTS**: プロジェクトルートにコピーして使うため、docs外に配置

### 各フォルダのmeta.yaml
- 各フォルダに `meta.yaml` を配置し、そのフォルダの責務と除外範囲を明記する
- `document_map.yaml` と `meta.yaml` の二重管理に見えるが、用途が異なる:
  - `document_map.yaml`: 全体俯瞰（ドキュメント間の関係）
  - `meta.yaml`: フォルダ単位の責務定義（何をここに置くべきか）

## 4. プレースホルダー設計

### 命名規則
- 形式: `[CATEGORY_ITEM]`
- 大文字 + アンダースコア区切り
- カテゴリプレフィックスで用途を明示

### 一覧（最小セット）

| プレースホルダー | カテゴリ | 用途 |
|---|---|---|
| `[PROJECT_NAME]` | PROJECT | プロジェクト名 |
| `[PROJECT_DESCRIPTION]` | PROJECT | 概要（1行） |
| `[PROJECT_PURPOSE]` | PROJECT | 目的 |
| `[TARGET_USERS]` | PROJECT | 対象ユーザー |
| `[MVP_SCOPE]` | PROJECT | MVPスコープ |
| `[TECH_LANGUAGE]` | TECH | 主要言語 |
| `[TECH_STACK]` | TECH | 技術スタック |
| `[TECH_FRAMEWORK]` | TECH | フレームワーク |
| `[DOMAIN_ROLE_1]` | DOMAIN | ドメイン固有の役割 |
| `[DOMAIN_CONSTRAINT_1]` | DOMAIN | ドメイン固有の制約 |

### 追加時のルール
- 既存プレースホルダーで代用できないか検討してから追加する
- 追加時は `PLACEHOLDER_GUIDE.md` も必ず更新する

## 5. メタデータ設計

### document_map.yaml
- 全ドキュメントの一覧管理
- 各ドキュメントの `id`、`title`、`path`、`responsibility`、`status` を記録
- LLMがプロジェクト全体を俯瞰するために使う

### meta.yaml（各フォルダ）
- フォルダの責務を定義する
- `includes`（このフォルダに置くもの）と `excludes`（置かないもの）を明記
- ドキュメント追加時に「ここに置くべきか？」の判断基準になる

### 一貫性の維持
- ファイル追加/削除/移動時は `document_map.yaml` と該当フォルダの `meta.yaml` を**両方**更新する
- ルートの `meta.yaml` は子フォルダの増減がある場合のみ更新する

## 6. 実装優先順位

### Phase A（必須）— テンプレートとして最低限動くもの
1. ディレクトリ構造
2. LLMエントリーポイント
3. コアドキュメント（REQUIREMENTS.md、DEVELOPMENT_PROCESS.md、PLAN.md、ARCHITECTURE.md、LLM_GUIDE.md）
4. メタデータファイル
5. README.md、SETUP_GUIDE.md、PLACEHOLDER_GUIDE.md

### Phase B（推奨）— 使いやすさの向上
6. 各 `*_GUIDE.md`（書き方ガイド）
7. `LANGUAGE_SPECIFIC_RULES.md`（言語別ルール）
8. ログテンプレート（ISSUE_LOG_TEMPLATE.md、R_ISSUE_LOG_TEMPLATE.md、HANDOFF_TEMPLATE.md）

### 判断基準
- Phase A だけでプロジェクトを開始できる状態にする
- Phase B は「あると便利」だが、なくても開発は進められる

## 7. 注意事項（変更時のルール）

### 構造変更時
- `document_map.yaml` と `meta.yaml` の整合性を必ず確認する
- 変更履歴（下記）に理由を記録する
- gitコミットメッセージは `template: [変更概要]` のプレフィックスを使う

### ファイル追加時
- 既存のテンプレートやガイドを参考にフォーマットを統一する
- プレースホルダーを使う場合は `PLACEHOLDER_GUIDE.md` に追記する

### 削除時
- そのファイルを参照している箇所を全て確認・更新する
- `grep -r "ファイル名" template/` で参照箇所を確認できる

## 変更履歴

テンプレート構造に対する重要な変更とその理由を記録する。
実際のdiffはgitで確認できるため、ここには「なぜ変えたか」のみ書く。

| 日付 | 変更概要 | 理由 |
|------|---------|------|
| 2026-02-07 | 初版作成 | dcs-sim投資ヘルプツールのドキュメント構造を汎用化し、他プロジェクトで再利用可能にするため |
| 2026-02-07 | handoverをdocs/logs/配下に移動 | フォルダ数削減。引き継ぎ文書はログの一種であり、logs配下が自然 |
| 2026-02-07 | TEMPLATE_DESIGN_POLICY.md作成 | テンプレートの設計方針と経緯を文書化し、改修時の判断基準を残すため |
| 2026-02-14 | r-issueテンプレートを構造化項目へ更新 + 専用履歴ファイル追加 | 旧`detail`形式が運用で混在し、何が起きて変更したかを後追いしづらかったため |
