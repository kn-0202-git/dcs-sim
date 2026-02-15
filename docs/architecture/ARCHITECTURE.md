# アーキテクチャ概要（P&ID バルブ操作シミュレーター）

## 1. 目的
- 要件を満たすための技術方針と構成要素を明確にする。

## 2. スコープ
- 対象: Reactコンポーネント群、BFSアルゴリズム、SVG描画、状態管理
- 除外: サーバーサイド処理、データベース（開発プロセスは `docs/process/DEVELOPMENT_PROCESS.md`）

## 3. 技術スタック
- 言語/環境: TypeScript + Node.js（開発環境のみ）
- フレームワーク: React 19
- ビルド: Vite 7
- テスト: Vitest + @testing-library/react
- スタイリング: インラインスタイル
- 描画: SVG（ブラウザネイティブ）

## 4. データソース
- 標準トポロジー: TypeScript定数（`sampleData.ts` の nodes/pipes/valves）
- SVGトポロジー: アップロードSVGを parse/validate/build して生成（`svgParser`/`svgValidator`/`svgTopology`）
- 教育データ: CSV形式（phases, steps, rules）をブラウザ上で編集・反映

## 5. システム構成

```
PIDSimulator (Root Component)
├── Data Source Layer
│   ├── sample topology (nodes/pipes/valves)
│   └── svg topology (upload -> parse -> validate -> build)
├── State Layer
│   ├── dataSource: 'sample' | 'svg'
│   ├── valves / tankFilled (useState)
│   └── reachableNodes (useMemo, BFS)
├── Logic Layer
│   ├── computeReachableNodes()   (BFS algorithm)
│   └── isPipeActive()            (pipe flow check)
├── UI Layer
│   ├── ValveControlPanel
│   ├── TankControlPanel
│   ├── PIDCanvas (標準データ描画)
│   ├── SVGCanvas (アップロードSVG描画)
│   ├── SVG Upload UI (file input + status)
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
1. ユーザーがSVGをアップロード（任意） → parse/validate/build でSVGトポロジーを生成
2. 生成成功時は `dataSource='svg'`、失敗時はエラー表示して標準データへフォールバック
3. ユーザーがバルブ/タンクを操作 → toggleValve()/toggleTank() で状態更新
4. useMemo が reachableNodes を BFS で再計算
5. 選択中データソースに応じて PIDCanvas または SVGCanvas が描画更新

## 7. デプロイ
- GitHub Pages: main push 時に GitHub Actions で自動デプロイ（`.github/workflows/deploy.yml`）
- Docker: dev（5173）/ prod（3000）マルチステージ（`Dockerfile` + `docker-compose.yml`）
- ローカル: `npm run dev`（Vite dev server）

## 8. 将来的な拡張候補（検討）
- 流量表示（配管ごとの流量アニメーション）
- 操作手順記録/再生
- 複数液種対応（色分け）
- アラーム機能
- 設定保存/読込

## 9. 関連ドキュメント
- 要件: `docs/requirements/REQUIREMENTS.md`
- 仕様書: `pid-simulator-specification.md`
- ガイド: `docs/guides/PLANT_CUSTOMIZATION.md`
