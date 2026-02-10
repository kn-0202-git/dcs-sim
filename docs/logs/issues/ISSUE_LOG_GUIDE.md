# issueログ 書き方ガイド

このガイドでは、issue開発ログ（`StepX-Y.md`）の書き方を説明します。

> 最新の必須項目は `docs/logs/issues/ISSUE_LOG_TEMPLATE.md` を正本とする。
> ガイドの例と差分がある場合はテンプレート側を優先する。

## 目的

issueログの目的は：
- 実装内容と判断理由を記録する
- 次の開発者（または将来の自分）が理解できるようにする
- トラブルシューティングの履歴を残す
- プロジェクトの進捗を追跡する

## 対象読者

- 次に開発を引き継ぐ開発者
- 将来の自分
- レビュアー
- LLM（開発支援AI）

## 基本ルール

### 1. 中学生でも読める文章を書く

- 専門用語を使う場合は、簡単に説明を加える
- 短い文章で、明確に書く
- 箇条書きを活用する

**良い例:**
```markdown
development log: ユーザー認証機能を追加。メールアドレスとパスワードでログインできるようにした。パスワードはbcryptでハッシュ化して保存する。
```

**悪い例:**
```markdown
development log: Auth module implemented with JWT-based stateless authentication leveraging bcrypt hashing algorithm for credential storage optimization.
```
（問題: 専門用語が多く、説明がない）

## 各項目の書き方

### issue

**フォーマット:** `StepX-Y [ステータス] タイトル`

**例:**
```markdown
issue: Step1-1 [✅ resolved] ユーザー認証機能の実装
```

### development log（開発記録）

**書くべき内容:**
- 何を作ったか
- どこを変更したか
- 主要な機能の説明

**良い例:**
```markdown
development log: ユーザー登録・ログイン機能を実装した。`/api/auth/register` と `/api/auth/login` のエンドポイントを追加。パスワードはbcryptでハッシュ化してDBに保存する。ログイン後はJWTトークンを発行し、クライアントに返す。
```

**ポイント:**
- 具体的に書く（「認証を実装した」だけでは不十分）
- 技術用語は簡潔に説明する
- 箇条書きでも良い

### technical/architecture reason（技術/アーキテクチャの理由）

**書くべき内容:**
- なぜその技術を選んだか
- なぜその構成にしたか
- 他の選択肢との比較（あれば）

**良い例:**
```markdown
technical/architecture reason: JWTを選んだ理由は、サーバー側でセッション管理が不要で、スケールしやすいため。パスワードハッシュ化にbcryptを使ったのは、レインボーテーブル攻撃に強く、計算コストを調整できるため。
```

**悪い例:**
```markdown
technical/architecture reason: よく使われているから
```
（問題: 判断理由が不明確）

### cautions（注意点）

**書くべき内容:**
- 運用時の注意事項
- 拡張時に気をつけること
- 既知の制限事項

**良い例:**
```markdown
cautions: JWTトークンの有効期限は24時間。期限切れの場合は再ログインが必要。将来リフレッシュトークンの実装を検討する。パスワードは最低8文字以上の制限があるが、現在はフロントエンドでのみチェックしている。
```

### troubles（トラブル）

**書くべき内容:**
- 発生した問題
- どう解決したか
- 影響範囲

**良い例:**
```markdown
troubles: bcryptのハッシュ生成が遅く、レスポンスタイムが3秒かかる問題が発生。saltRoundsを12から10に下げて解決（セキュリティとパフォーマンスのバランスを考慮）。既存のハッシュには影響なし。
```

**問題がない場合:**
```markdown
troubles: なし
```

### r-issue

**書くべき内容:**
- 記録したr-issueのID
- 簡単な説明

**良い例:**
```markdown
r-issue: r3 - リフレッシュトークンの実装を検討
```

**r-issueがない場合:**
```markdown
r-issue: なし
```

### edited documents（編集したドキュメント）

**書くべき内容:**
- 変更・追加したファイルのリスト

**良い例:**
```markdown
edited documents: `src/auth/register.ts`, `src/auth/login.ts`, `src/utils/jwt.ts`, `tests/auth.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step1-1.md`, `README.md`
```

### next action（次のアクション）

**書くべき内容:**
- 残っているタスク
- 次に実施すべきこと
- 関連するissue

**良い例:**
```markdown
next action: Step1-2 - パスワードリセット機能の実装。メール送信機能との連携が必要。
```

## checklist（チェックリスト）

issue開始時にこのチェックリストをログファイルに貼り付け、完了したらチェックを入れます。

**使い方:**
```markdown
checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step1-1.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [ ] r-issue recorded (or "none")  ← まだ未完了
- [ ] Plan issue set to `✅ resolved`
- [ ] Requirements updated if spec changed
- [ ] Documentation meta updated if docs changed
- [ ] CLI/feature changes reflected in `README.md` user guide
```

## 具体例

### 例1: シンプルなissue

```markdown
issue: Step2-3 [✅ resolved] ボタンのスタイル修正
development log: ログインボタンの色を青から緑に変更。CSSファイル（`styles/button.css`）を編集した。
technical/architecture reason: UIデザインガイドラインに合わせるため。
cautions: 他のボタン（登録、キャンセル等）は現状維持。将来的に統一スタイルを検討。
troubles: なし
r-issue: なし
edited documents: `styles/button.css`, `docs/process/PLAN.md`, `docs/logs/issues/Step2-3.md`
next action: Step2-4 - レスポンシブ対応

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step2-3.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
```

### 例2: トラブルがあったissue

```markdown
issue: Step3-1 [✅ resolved] データベース接続の実装
development log: PostgreSQLとの接続を確立。`src/db/connection.ts` で接続プールを作成し、環境変数からDB接続情報を取得するようにした。
technical/architecture reason: 接続プールを使うことで、複数のリクエストを効率的に処理できる。環境変数を使うことで、本番環境と開発環境で異なるDBを使える。
cautions: 接続プールのサイズは現在10に設定。負荷が高い場合は調整が必要。環境変数（DB_HOST, DB_PORT, DB_USER, DB_PASSWORD）が設定されていないと起動しない。
troubles: 最初、接続タイムアウトエラーが頻発。DB_HOSTの設定が間違っていた（localhostではなく127.0.0.1を使用すべき）。`.env.example` に正しい設定例を追加して解決。
r-issue: r5 - 接続プールサイズの最適化を検討
edited documents: `src/db/connection.ts`, `.env.example`, `tests/db.test.ts`, `docs/process/PLAN.md`, `docs/logs/issues/Step3-1.md`, `docs/logs/r_issues/r5.md`, `README.md`
next action: Step3-2 - データモデルの定義

checklist:
- [x] Requirements reviewed (updated if needed)
- [x] Plan issue set to `🔵 in_progress`
- [x] Issue log created (`docs/logs/issues/Step3-1.md`)
- [x] Tests written first (Red)
- [x] Minimal implementation passes tests (Green)
- [x] Refactor complete (Refactor)
- [x] Tests executed after implementation, results verified
- [x] r-issue recorded (or "none")
- [x] Plan issue set to `✅ resolved`
- [x] Requirements updated if spec changed
- [x] Documentation meta updated if docs changed
- [x] CLI/feature changes reflected in `README.md` user guide
```

## よくある間違いと対処法

### 間違い1: 記録が短すぎる

**問題:**
```markdown
development log: 認証を実装した
```

**対処法:**
具体的に何を作ったか、どこを変更したかを書く。

### 間違い2: 専門用語だらけ

**問題:**
```markdown
technical/architecture reason: Leveraged OAuth2.0 with PKCE flow for enhanced security posture
```

**対処法:**
中学生でも理解できるように、簡単な言葉で説明する。

### 間違い3: チェックリストを埋めない

**問題:**
チェックリストが全て `- [ ]` のまま

**対処法:**
issue完了時に全てチェックを入れる。未完了の項目があれば完了させる。

## まとめ

良いissueログは：
- **具体的**: 何をしたか明確
- **理由が明確**: なぜそうしたか説明されている
- **簡潔**: 必要な情報が過不足なく記載
- **読みやすい**: 中学生でも理解できる

次のステップ:
1. issueログを書く
2. チェックリストを確認
3. `docs/process/PLAN.md` のissueステータスを `✅ resolved` に更新
