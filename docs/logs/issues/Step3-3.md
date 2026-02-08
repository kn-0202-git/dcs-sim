# Step3-3: 安全性強化

## 概要
コードレビュー P1 #6-7 / P2 #10 の対応。未知条件のfail-safe化、CSVバリデーション全行チェック、エラーハンドリング追加。

## 対象ファイル
- `src/education/conditionEvaluator.ts` — 未知条件を `false` に変更
- `src/components/CSVEditorPanel.tsx` — 全行バリデーション
- `src/components/PIDSimulator.tsx` — toggleValve/toggleTank に try-catch

## 開発ログ

### 技術的判断
1. **未知条件**: `true` → `false` に変更。fail-safe原則。CSV設定ミスを早期発見。
2. **CSVバリデーション**: 先頭行だけでなく全行の必須フィールドをチェック。
3. **try-catch**: checkRules/evaluateCondition の呼び出しをラップ。エラー時はコンソール警告。

## チェックリスト
- [ ] conditionEvaluator 未知条件 false 化
- [ ] CSVEditorPanel 全行バリデーション
- [ ] PIDSimulator try-catch 追加
- [ ] 既存テスト更新（未知条件のテスト）
- [ ] 全テストパス
