# 汎用プロジェクトテンプレート

## 概要
このテンプレートは、ソフトウェア開発プロジェクトを効率的に開始・運用するためのドキュメント構造を提供します。

## 特徴
- **言語非依存**: Python、Node.js、Java等、あらゆる言語に対応
- **TDD指向**: テスト駆動開発のプロセスが組み込まれています
- **LLM対応**: Claude、Codex、Gemini等のLLMと協働しやすい構造
- **issue管理**: step-issue、issue、r-issueの3層管理
- **引き継ぎ文書**: プロジェクトの履歴が追跡可能

## クイックスタート

1. **テンプレートをコピー**
   ```bash
   cp -r template/ ../my-new-project/
   cd ../my-new-project/
   ```

2. **セットアップガイドを参照**
   `SETUP_GUIDE.md` を開いて、プレースホルダーの置換手順に従う

3. **要件を記入**
   `docs/requirements/REQUIREMENTS.md` にプロジェクトの要件を記入

4. **開発開始**
   `docs/process/DEVELOPMENT_PROCESS.md` を参照して最初のissueを作成

## ドキュメント構成

- `LLM_ENTRY_POINTS/`: LLM向けエントリーポイント
- `docs/requirements/`: 要件定義書
- `docs/process/`: 開発プロセス、計画、LLMガイド
- `docs/architecture/`: アーキテクチャ設計
- `docs/logs/`: issue/r-issueログ、引き継ぎ文書

詳細は `SETUP_GUIDE.md` を参照してください。

## ファイル構造

```
template/
├── README.md                    # このファイル
├── SETUP_GUIDE.md               # 新規プロジェクト立ち上げ手順
├── PLACEHOLDER_GUIDE.md         # プレースホルダー一覧
├── LLM_ENTRY_POINTS/            # LLM用エントリーポイント
│   ├── CLAUDE.md
│   ├── CODEX.md
│   └── GEMINI.md
└── docs/                        # ドキュメントルート
    ├── document_map.yaml
    ├── meta.yaml
    ├── requirements/
    ├── process/
    ├── architecture/
    └── logs/
        ├── issues/
        ├── r_issues/
        └── handover/
```

## 次のステップ

1. `SETUP_GUIDE.md` を読む
2. プレースホルダーを置換する
3. 要件定義書を書く
4. 最初のstep-issueを作成する

## ライセンス

このテンプレートは自由に使用・改変できます。
