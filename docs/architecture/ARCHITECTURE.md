# アーキテクチャ概要（P&ID バルブ操作シミュレーター）

## 1. 目的
- 要件を満たすための技術方針と構成要素を明確にする。

## 2. スコープ
- 対象: Reactコンポーネント群、BFSアルゴリズム、SVG描画、状態管理
- 除外: サーバーサイド処理、データベース（開発プロセスは `docs/process/DEVELOPMENT_PROCESS.md`）

## 3. 技術スタック
- 言語/環境: TypeScript + Node.js（開発環境のみ）
- フレームワーク: React 19
- ビルド: Vite 6
- テスト: Vitest + @testing-library/react
- スタイリング: インラインスタイル
- 描画: SVG（ブラウザネイティブ）

## 4. データソース
- P&IDトポロジーデータ: TypeScriptファイル内の定数定義（nodes, pipes）
- 教育データ: CSV形式（phases, steps, rules）- ブラウザ上で編集可能

## 5. システム構成

```
PIDSimulator (Root Component)
├── State Layer
│   ├── valves: Record<string, boolean>     (useState)
│   ├── tankFilled: Record<string, boolean>  (useState)
│   └── reachableNodes: Set<string>          (useMemo, BFS)
├── Data Layer
│   ├── nodes: Node[]          (定数データ)
│   └── pipes: Pipe[]          (定数データ)
├── Logic Layer
│   ├── computeReachableNodes()   (BFS algorithm)
│   └── isPipeActive()            (pipe flow check)
├── UI Layer
│   ├── ValveControlPanel
│   ├── TankControlPanel
│   ├── PIDCanvas (SVG)
│   │   ├── PipeRenderer
│   │   ├── ValveRenderer
│   │   ├── TankRenderer
│   │   └── JunctionRenderer
│   └── LegendSummary
└── Education Layer (Phase 2)
    ├── CSVParser
    ├── ConditionEvaluator
    ├── PhaseStepManager
    └── RuleCheckEngine
```

## 6. データフロー
1. ユーザーがバルブ/タンクをクリック → toggleValve()/toggleTank()ハンドラ発火
2. useState が valves/tankFilled 状態を更新
3. useMemo が reachableNodes を BFS で再計算
4. React が SVG要素を新しい reachableNodes に基づいて再レンダリング
5. 配管色、バルブ色、タンク色がリアクティブに更新

## 7. 将来的な拡張候補（検討）
- 流量表示（配管ごとの流量アニメーション）
- 操作手順記録/再生
- 複数液種対応（色分け）
- アラーム機能
- 設定保存/読込

## 8. 関連ドキュメント
- 要件: `docs/requirements/REQUIREMENTS.md`
- 仕様書: `pid-simulator-specification.md`
