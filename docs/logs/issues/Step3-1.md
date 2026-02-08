# Step3-1: データ層の疎結合化

## 概要
コードレビュー P0 #1-3 / P1 #4-5 の対応。トポロジーデータと教育ロジック間の暗黙的な結合を排除し、別プラントへの差し替えをコード変更なしで可能にする。

## 対象ファイル
- `src/data/sampleData.ts` — allValveIds/allTankIds/nodeMap/initialTankFilled を自動導出
- `src/data/topologyValidator.ts` — 新規: トポロジー整合性チェック
- `src/education/conditionEvaluator.ts` — tankIdMap パラメータ追加
- `src/components/PIDCanvas.tsx` — キャンバスサイズ自動算出
- `src/components/PIDSimulator.tsx` — tankIdMap の引き渡し、バリデーション呼び出し

## 開発ログ

### 技術的判断
1. **allValveIds/allTankIds の自動導出**: nodes/pipes 配列から `filter` + `map` で導出。手動同期のリスクを排除。
2. **tankIdMap**: CSV条件式の `T1` → ノードID `tank-T1` の変換マッピングを明示化。nodes 配列のタンク出現順で番号付け。
3. **topologyValidator**: パイプの from/to 検証、重複ID検証。dev モードのみ実行。
4. **キャンバスサイズ**: ノード座標の max + 固定マージンで算出。

### 注意事項
- 既存テスト86件への影響を最小限にする（API後方互換性を維持）
- conditionEvaluator の tankIdMap は optional パラメータ（デフォルトは従来の `tank-T${n}` フォールバック）

## チェックリスト
- [ ] sampleData.ts の自動導出
- [ ] topologyValidator.ts 新規作成
- [ ] conditionEvaluator.ts tankIdMap 対応
- [ ] PIDCanvas.tsx キャンバスサイズ自動算出
- [ ] PIDSimulator.tsx tankIdMap 引き渡し
- [ ] topologyValidator テスト作成
- [ ] 既存テスト全パス確認
