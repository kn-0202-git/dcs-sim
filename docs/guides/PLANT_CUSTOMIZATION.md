# プラント差し替えガイドライン

このドキュメントでは、シミュレーターのトポロジー（P&ID図）とCSVルールを別のプラント構成に差し替える手順を説明します。

## 1. アーキテクチャ概要

シミュレーターのデータは3層で構成されています：

```
トポロジーデータ (sampleData.ts)  ← プラント構造（ノード・パイプ・座標）
       ↓
CSVルール (csvParser.ts)          ← 教育シナリオ（フェーズ・ステップ・安全ルール）
       ↓
UI (PIDSimulator, PIDCanvas)      ← 変更不要
```

**差し替え時に変更するファイルは `src/data/sampleData.ts` のみ**です。CSVルールは画面上のCSV設定パネルからも変更できます。

## 2. トポロジーデータの作成

### 2.1 ノード定義 (`nodes`)

`src/data/sampleData.ts` の `nodes` 配列を編集します。

```typescript
import type { PIDNode, Pipe } from '../types';

export const nodes: PIDNode[] = [
  // type: 'source' — 液体供給元（1つ以上必要）
  { id: 'source', x: 50, y: 200, label: '液体A\n(供給)', type: 'source' },

  // type なし — 接続点（パイプの分岐・合流点）
  { id: 'n1', x: 130, y: 200 },

  // type: 'tank' — タンク（液体を貯留、クリックで満/空切替）
  { id: 'tank-T1', x: 370, y: 200, label: 'T-1', type: 'tank' },

  // type: 'outlet' — 出口
  { id: 'outlet', x: 530, y: 240, label: '出口', type: 'outlet' },
];
```

#### ノードのプロパティ

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | はい | 一意のID。パイプの接続先として使用 |
| `x` | number | はい | SVG上のX座標（ピクセル） |
| `y` | number | はい | SVG上のY座標（ピクセル） |
| `label` | string | いいえ | 表示ラベル。`\n` で改行可能 |
| `type` | string | いいえ | `'source'` / `'tank'` / `'outlet'` / `'inlet'` / `'junction'`。未指定は接続点 |

#### ノードタイプの動作

| タイプ | SVG表示 | クリック | BFS動作 |
|--------|---------|---------|---------|
| `source` | 矩形（60x50） | 不可 | 液あり→BFS起点 |
| `tank` | 矩形（55x45）+状態表示 | 満/空切替 | 液あり→BFS起点、空→通過遮断 |
| `outlet` | 矩形（50x40） | 不可 | 通常ノード |
| 未指定 | 小円（r=5） | 不可 | 通常ノード |

### 2.2 パイプ定義 (`pipes`)

```typescript
export const pipes: Pipe[] = [
  // バルブなし（常時開通）
  { id: 'p1', from: 'source', to: 'n1', valveId: null },

  // バルブあり（V1で開閉制御）
  { id: 'p2', from: 'n1', to: 'n2', valveId: 1 },
];
```

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | string | はい | 一意のID |
| `from` | string | はい | 始点ノードID（nodes に存在する必要あり） |
| `to` | string | はい | 終点ノードID（nodes に存在する必要あり） |
| `valveId` | number \| null | はい | バルブ番号（null = バルブなし・常時開通） |

**注意**: パイプは双方向に流れます。`from`/`to` の向きは描画方向のみに影響します。

### 2.3 自動導出される値

以下は `nodes`/`pipes` から自動的に導出されるため、**手動で定義する必要はありません**：

- `allValveIds` — 全バルブID一覧
- `allTankIds` — 全タンクID一覧
- `nodeMap` — ノードID→ノードのルックアップ
- `tankIdMap` — CSV短縮名（T1, T2）→ノードIDのマッピング
- `initialValves` — 全バルブ閉の初期状態
- `initialTankFilled` — source=液あり、tank=空の初期状態

## 3. SVG 座標の決め方

キャンバスサイズはノード座標から自動算出されます：
- 幅 = 最大X座標 + 70px
- 高さ = 最大Y座標 + 60px

### 座標設計のコツ

1. **source** を左端（x=50程度）に配置
2. **outlet** を右端に配置
3. 接続点は等間隔（80px程度）で配置
4. タンクは分岐後に配置
5. ノード同士が重ならないように最低60px間隔を確保
6. バルブはパイプの中点に自動配置されるため、パイプが短すぎないよう注意

```
例: x=50, 130, 210, 290, 370, 450, 530 → 80px間隔
    y=200（メインライン）, 280（分岐ライン）
```

## 4. CSV ルールの設定

### 4.1 フェーズ定義 (phases)

```csv
phase_id,phase_name,order
preparation,準備,1
operation,運転,2
shutdown,停止,3
```

### 4.2 ステップ定義 (steps)

```csv
phase_id,step_id,step_name,description,instruction,condition,order
preparation,prep-1,初期確認,全バルブ閉確認,全バルブが閉じていることを確認,ALL_VALVES_CLOSED,1
preparation,prep-2,供給開始,V1を開ける,バルブ1を開けてください,V1=OPEN,2
```

### 4.3 安全ルール定義 (rules)

```csv
rule_id,rule_name,condition,error_message,severity,phases
rule-001,供給未開放,OPENING:V2+ AND V1=CLOSED,V1を先に開けてください,warning,all
rule-002,空タンク送液,OPENING:V6 AND T1=EMPTY,T1が空です,critical,all
```

### 4.4 条件式の文法

| 条件式 | 意味 |
|--------|------|
| `V{n}=OPEN` | バルブn が開いている |
| `V{n}=CLOSED` | バルブn が閉じている |
| `T{n}=FILLED` | タンクn に液がある |
| `T{n}=EMPTY` | タンクn が空 |
| `ALL_VALVES_CLOSED` | 全バルブ閉 |
| `ALL_VALVES_OPEN` | 全バルブ開 |
| `OPENING:V{n}` | バルブn を開けようとしている（ルール用） |
| `OPENING:V{n}+` | バルブn以上を開けようとしている |
| `CLOSING:V{n}` | バルブn を閉じようとしている |
| `A AND B` | AかつB（AND は OR より優先度高） |
| `A OR B` | AまたはB |

**タンク番号の対応**: `T1`, `T2`, ... は `nodes` 配列のタンク出現順に対応します。

## 5. トポロジーバリデーション

dev モード（`npm run dev`）で起動すると、自動的にトポロジーの整合性チェックが実行されます。

検証項目：
- ノードIDの重複がないか
- パイプIDの重複がないか
- パイプの from/to が存在するノードを参照しているか
- バルブIDの重複がないか

エラーがあればブラウザのコンソールに警告が表示されます。

テストで手動検証する場合：

```typescript
import { validateTopology } from './data/topologyValidator';
import { nodes, pipes } from './data/sampleData';

const result = validateTopology(nodes, pipes);
console.log(result.valid, result.errors);
```

## 6. 動作確認チェックリスト

新しいトポロジーを作成したら、以下を確認してください：

- [ ] `npm run build` が成功する
- [ ] `npm test` が全テストパスする
- [ ] `npm run dev` でコンソールにバリデーションエラーが出ない
- [ ] ブラウザで P&ID 図が正しく表示される
- [ ] 全バルブが制御パネルに表示される
- [ ] バルブ開閉で液の流れ（色変化）が正しく動作する
- [ ] タンクの満/空切替が動作する
- [ ] 空タンクからの送液が遮断される
- [ ] CSVルールによる警告が正しく表示される
- [ ] 訓練モードでステップが順に進行できる

## 7. 例: 新しいプラントの作成

### 簡単な2タンク直列プラント

```typescript
// src/data/sampleData.ts を以下に書き換え

import type { PIDNode, Pipe, ValveState, TankFilledState } from '../types';

export const nodes: PIDNode[] = [
  { id: 'supply', x: 50, y: 150, label: '原料供給', type: 'source' },
  { id: 'j1', x: 150, y: 150 },
  { id: 'reactor', x: 280, y: 150, label: '反応器', type: 'tank' },
  { id: 'j2', x: 400, y: 150 },
  { id: 'storage', x: 530, y: 150, label: '貯蔵タンク', type: 'tank' },
  { id: 'drain', x: 650, y: 150, label: '排出', type: 'outlet' },
];

export const pipes: Pipe[] = [
  { id: 'p1', from: 'supply', to: 'j1', valveId: null },
  { id: 'p2', from: 'j1', to: 'reactor', valveId: 1 },
  { id: 'p3', from: 'reactor', to: 'j2', valveId: 2 },
  { id: 'p4', from: 'j2', to: 'storage', valveId: 3 },
  { id: 'p5', from: 'storage', to: 'drain', valveId: 4 },
];

// 以下は自動導出（変更不要）
export const allValveIds = ...
export const allTankIds = ...
// ...
```

この場合のCSV条件式：
- `T1=FILLED` → reactor（1番目のタンク）
- `T2=FILLED` → storage（2番目のタンク）
- `V1`〜`V4` → 4つのバルブ
