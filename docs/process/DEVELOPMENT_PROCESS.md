# 開発プロセス

## 1. 目的
- 実装前に進め方を明確化し、TDDで確実に品質を担保する。
- 仕様変更やデータ制約に耐える、反復型の開発手順を採用する。

## 2. 前提
- 要件とアーキテクチャが合意済みである
- ブラウザのみで動作（サーバー不要）

## 3. 役割
- プロダクトマネージャー: スコープ管理・優先度付け
- テックリード: 技術方針と実現性、品質基準
- UX/業務設計: 使い勝手と運用フロー
<!-- 以下、プロジェクト固有の役割を追加 -->
- プラントオペレーター: バルブ操作の訓練と手順確認

## 4. 開発フロー（概要）
1) 要件の確定（`docs/requirements/REQUIREMENTS.md`）
2) 開発計画の作成（`docs/process/PLAN.md`）
3) ステップ（step-issue）をissueに分解
4) 実装（TDD）とレビュー（実装後はテストを実行）
5) 課題の記録（r-issue）
6) 要件へ反映し、計画を更新
7) 検証（データ整合性、再現性）
8) ドキュメント更新（使い方、運用）

## 4.1 step-issue / issue / r-issue の運用
- step-issue: 機能単位のまとまり。複数のissueを内包する
- issue: 実装単位。TDDで完結する最小の作業単位
- r-issue: 課題管理リスト。レビュー結果や後で解決したい不具合、新規要件を記録

### 運用ルール
- Requirements → Plan → issue → r-issue → Requirements へ反映のループで運用する
- step-issueは「大体の機能」単位、issueは実装可能な最小単位に分割する
- 各issueには開発ログを残し、設計意図と注意点を記録する

### 運用ループ
1) Requirementsに仕様を書く
2) Planにstep-issueを書く
3) step-issueからissueを切り出して開発
4) 発生した課題はr-issueに記録
5) 仕様へ反映し、step-issueを更新/追加

### issueのステータス表記（Plan内）
- 表記: `StepX-Y [ステータス]: 内容`
- 状態（記号つき）: `🟡 open / 🔵 in_progress / ✅ resolved / ⚪ deferred`

### issue開発ログ（Plan内）
- 目的: 単機能ごとの開発記録を残し、判断理由と注意点を共有する
- 保存先: `docs/logs/issues/`（issueごとに1ファイル）
- ファイル名: `StepX-Y.md`（例: `Step1-1.md`）
- 記録内容: 実装内容、採用理由、注意点、トラブルと解決策、編集したドキュメント
- 書き方のルール: 中学生でも読める、短くてわかりやすい文章にする

### issue開発チェックリスト
- issue開始時にチェックリストをログへ貼り付ける
- 実装の各節目でチェックし、完了時に全て埋める

#### 記録テンプレート
```
issue: StepX-Y [ステータス] タイトル
development log: 何を作ったか / 変更点の要約
technical/architecture reason: なぜその構成・技術を選んだか
cautions: 運用や拡張で気をつけること
troubles: 発生内容 / トラブルシュート / 影響範囲
edited documents: 変更したファイルの一覧
next action: 残タスクや関連issue

checklist:
- [ ] Requirements reviewed (updated if needed)
- [ ] Plan issue set to `🔵 in_progress`
- [ ] Issue log created (`docs/logs/issues/StepX-Y.md`)
- [ ] Tests written first (Red)
- [ ] Minimal implementation passes tests (Green)
- [ ] Refactor complete (Refactor)
- [ ] Tests executed after implementation, results verified
- [ ] r-issue recorded (or "none")
- [ ] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [ ] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
```

### r-issue の運用ルール
- 記録フォーマット: `id / 内容 / 種別(不具合/改善/新要件) / 優先度 / 状態`
- ID採番: `r1, r2, r3 ...`
- 状態（記号つき）: `🟡 open / 🔵 in_progress / ✅ resolved / ⚪ deferred`
- 記録タイミング: レビュー後、または指定があったとき
- その他のタイミングでは「r-issueとして記録しますか？」と確認する
- r-issueの詳細ログは `docs/logs/r_issues/` に作成し、issueログと同様に記録する

## 5. TDDの進め方
1) **Red**: 先にテストを書く（API/入出力/境界条件）
2) **Green**: 最小実装でテストを通す
3) **Refactor**: 読みやすさ・拡張性を高める
4) 必要に応じてテスト追加

### テストの対象
- BFSアルゴリズム: 各種トポロジーでの到達判定（全閉、全開、空タンク遮断、循環パス等）
- isPipeActive: バルブ開閉と到達状態の組み合わせ
- 境界条件: 空グラフ、孤立ノード、単一ノード
- 条件式パーサー: AND/OR/アクション条件の評価（Phase 2）
- CSVパーサー: 正常系/異常系/空データ（Phase 2）

## 6. 受け入れ基準（Definition of Done）
- 主要テストがパス
- 再現性が確保される（同じ入力で同じ結果）
- README/運用手順が更新済み
- MVP範囲の機能が一連で動作

## 7. ブランチ/変更管理（軽量運用）
- まずは `main` 直で進める（小さな変更単位）
- 変更履歴は `docs/requirements/REQUIREMENTS.md` と `docs/process/DEVELOPMENT_PROCESS.md` を更新
- 必要に応じて機能ごとに短命ブランチを作成

## 8. 検証/運用
- 依存インストール: `npm install`
- 開発サーバー: `npm run dev`
- テスト: `npm test`
- テスト(watch): `npm run test:watch`
- ビルド: `npm run build`
- プレビュー: `npm run preview`

**言語別の実行手順は `docs/process/LANGUAGE_SPECIFIC_RULES.md` を参照**

## 9. 文書改定ルール
- ドキュメントの追加/削除/改名が発生したら、関連メタ情報も必ず更新する
- 変更対象:
  - `docs/document_map.yaml`
  - 対象フォルダの `docs/**/meta.yaml`
  - ルートの `docs/meta.yaml`（子階層の増減がある場合）
  - `README.md` のドキュメント一覧
  - 相互参照リンク（必要な場合のみ）

### README利用者ガイドの更新
- 以下の変更があった場合は、`README.md` の利用者ガイドを必ず更新する:
  - CLIオプションの追加/変更/削除
  - 新機能の追加
  - デフォルト設定の変更
  - 出力ファイルのパスや形式の変更
  - 動作環境の変更（言語バージョン、依存パッケージなど）
- 利用者が迷わないよう、コマンド例も合わせて更新する

## 10. レビュー観点（セルフレビュー）
- SVG座標が画面内に収まっているか
- バルブ操作からSVG更新のレスポンスが十分高速か
- 空タンクで液が正しく遮断されるか
- 型安全: any型を使用していないか
- コンポーネントの責務が明確か（単一責任原則）

## 11. 成果物
- `docs/requirements/REQUIREMENTS.md`（要件）
- `docs/process/DEVELOPMENT_PROCESS.md`（開発プロセス）
- `docs/process/PLAN.md`（開発計画）
- `docs/architecture/ARCHITECTURE.md`（アーキテクチャ）
- 実装コード一式（MVP）
- 使い方/運用手順（README追記）

## 12. 引き継ぎ文書
- 目的: 次のLLMが直前の作業と判断理由を短時間で把握できるようにする
- 保存先: `docs/logs/handover/HANDOFF_YYYY-MM-DD.md`
- 記載項目: 目的 / 何をやったか / 実行コマンド / 成果物 / 次のアクション / LLM / 日付 / 注意点 / 専門家ディスカッション
- 作成時は `docs/document_map.yaml` / `docs/**/meta.yaml` / `docs/meta.yaml` / `README.md` を更新する
