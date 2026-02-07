# P&ID バルブ操作シミュレーター 要件定義書・仕様書

## 1. 概要

### 1.1 目的
化学プラントのP&ID（配管計装図）を再現し、バルブの開閉操作によって液体がどこまで到達するかをシミュレーションするツール。DCS（分散制御システム）の画面のような操作感を実現する。

### 1.2 背景
- 既存のGrafana + SVGによるDCSシミュレーターの代替
- 教育・訓練用途での配管系統の理解促進
- バルブ操作手順の確認・検証

### 1.3 対象ユーザー
- プラントオペレーター
- エンジニア
- 教育・訓練担当者

---

## 2. 機能要件

### 2.1 バルブ操作機能

| 機能 | 説明 |
|------|------|
| 個別バルブ操作 | 各バルブをクリックでON/OFF切替 |
| 一括操作 | 全バルブを一括で開/閉 |
| 状態表示 | 開=緑、閉=赤で視覚的に表示 |

### 2.2 タンク状態管理機能

| 機能 | 説明 |
|------|------|
| 液あり/空の切替 | タンクをクリックで状態切替 |
| 液源としての動作 | 「液あり」タンクは液の供給源になる |
| 通過制御 | 「空」タンクは液の通過を遮断する |

### 2.3 配管可視化機能

| 機能 | 説明 |
|------|------|
| 通液状態表示 | 液が流れている配管=水色、流れていない=グレー |
| リアルタイム更新 | バルブ/タンク操作時に即座に反映 |
| 到達状況サマリー | 各機器への到達状況を一覧表示 |

### 2.4 液の流れロジック

```
【基本ルール】
1. 液は「液源」から流れ始める
2. 液源 = 液体A入口（常時）+ 液ありタンク
3. バルブが開いている経路のみ液が通過できる
4. 空のタンクに液が到達しても、その先には進まない
5. 液ありのタンクは液が通過できる（液源にもなる）
```

---

## 3. データ構造仕様

### 3.1 ノード（Node）

配管の接続点、タンク、入口/出口を表す。

```typescript
interface Node {
  id: string;          // 一意のID（例: "n1", "t1", "i1"）
  x: number;           // X座標（SVG上）
  y: number;           // Y座標（SVG上）
  label?: string;      // 表示ラベル（例: "T-1", "液体A\n(液張)"）
  type?: 'inlet' | 'outlet' | 'tank' | 'junction';  // ノードタイプ
}
```

**ノードタイプ**
| type | 説明 |
|------|------|
| `inlet` | 入口（常に液源） |
| `outlet` | 出口 |
| `tank` | タンク（液あり/空を切替可能） |
| `junction` または未指定 | 単なる接続点（配管の分岐・合流点） |

### 3.2 配管（Pipe）

2つのノード間を接続する配管。

```typescript
interface Pipe {
  id: string;          // 一意のID（例: "p1", "p2"）
  from: string;        // 始点ノードID
  to: string;          // 終点ノードID
  valveId: string | null;  // この配管上のバルブID（nullならバルブなし、例: "v17"）
}
```

**バルブの扱い**
- `valveId: null` → バルブなし（常時開通）
- `valveId: 17` → バルブ17がこの配管上にある（開閉で通過可否が変わる）

### 3.3 状態管理

```typescript
// バルブ状態: バルブID → 開閉状態
interface ValveState {
  [valveId: string]: boolean;  // true=開, false=閉（例: { "v17": true }）
}

// タンク状態: ノードID → 液あり状態
interface TankFilledState {
  [nodeId: string]: boolean;   // true=液あり, false=空
}
```

---

## 4. アルゴリズム仕様

### 4.1 到達可能ノード判定（BFS）

液源から開いているバルブを経由して到達できるノードを計算する。

```
【アルゴリズム: 到達可能ノード判定】

入力:
  - nodes: ノードリスト
  - pipes: 配管リスト
  - valves: バルブ状態
  - tankFilled: タンク液あり状態

出力:
  - reachableNodes: 到達可能なノードIDのSet

手順:
1. reachable = 空のSet
2. queue = 空のキュー

3. 液源を起点に追加:
   FOR each (nodeId, filled) IN tankFilled:
     IF filled == true:
       reachable.add(nodeId)
       queue.push(nodeId)

4. BFSで探索:
   WHILE queue is not empty:
     current = queue.shift()
     
     FOR each pipe IN pipes:
       // バルブチェック
       canPass = (pipe.valveId == null) OR (valves[pipe.valveId] == true)
       IF NOT canPass: CONTINUE
       
       // 次のノードを特定
       nextNode = null
       IF pipe.from == current: nextNode = pipe.to
       IF pipe.to == current: nextNode = pipe.from
       IF nextNode == null OR reachable.has(nextNode): CONTINUE
       
       // 【重要】空タンクからは先に進めない
       currentNodeData = getNode(current)
       IF currentNodeData.type == 'tank' AND tankFilled[current] == false:
         CONTINUE
       
       reachable.add(nextNode)
       queue.push(nextNode)

5. RETURN reachable
```

### 4.2 配管の通液判定

```
【アルゴリズム: 配管が通液中か判定】

入力:
  - pipe: 対象の配管
  - valves: バルブ状態
  - reachableNodes: 到達可能ノードSet

出力:
  - boolean: 通液中ならtrue

手順:
1. canPass = (pipe.valveId == null) OR (valves[pipe.valveId] == true)
2. IF NOT canPass: RETURN false
3. RETURN reachableNodes.has(pipe.from) AND reachableNodes.has(pipe.to)
```

---

## 5. UI仕様

### 5.1 画面構成

```
┌─────────────────────────────────────────┐
│ タイトル: P&ID バルブシミュレーター      │
├─────────────────────────────────────────┤
│ [バルブ制御]                            │
│ [全開] [全閉] [5:X] [8:O] [12:X] ...    │
├─────────────────────────────────────────┤
│ [タンク液あり]                          │
│ [液体A:液あり] [T-2:空] ...      │
├─────────────────────────────────────────┤
│                                         │
│         ┌──SVG 配管図──┐               │
│         │              │               │
│         │  (P&ID図)    │               │
│         │              │               │
│         └──────────────┘               │
│                                         │
├─────────────────────────────────────────┤
│ [凡例・到達状況サマリー]                │
└─────────────────────────────────────────┘
```

### 5.2 色仕様

| 要素 | 状態 | 色 |
|------|------|-----|
| 配管 | 通液中 | 水色 `#22d3ee` |
| 配管 | 通液なし | グレー `#9ca3af`（opacity: 0.4） |
| バルブ | 開 | 緑 `#22c55e` |
| バルブ | 閉 | 赤 `#dc2626` |
| タンク | 液あり | 水色 `#0891b2` |
| タンク | 空（液到達中） | 緑 `#059669` |
| タンク | 空（液なし） | グレー `#6b7280` |
| 接続点 | 液あり | 水色 `#22d3ee` |
| 接続点 | 液なし | グレー `#9ca3af` |

### 5.3 インタラクション

| 操作 | 対象 | 結果 |
|------|------|------|
| クリック | バルブ（図上の丸） | 開↔閉を切替 |
| クリック | バルブボタン（上部） | 開↔閉を切替 |
| クリック | タンク（図上） | 液あり↔空を切替 |
| クリック | タンクボタン（上部） | 液あり↔空を切替 |
| クリック | 全開ボタン | 全バルブを開 |
| クリック | 全閉ボタン | 全バルブを閉 |

---

## 6. 実装仕様

### 6.1 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | React |
| 描画 | SVG |
| 状態管理 | React useState/useMemo |
| スタイリング | インラインスタイル or Tailwind CSS |

### 6.2 コンポーネント構成

```
PIDSimulator (メインコンポーネント)
├── 状態
│   ├── valves: バルブ状態
│   └── tankFilled: タンク液あり状態
├── 算出値
│   └── reachableNodes: 到達可能ノード（useMemo）
├── UI
│   ├── バルブ制御ボタン群
│   ├── タンク制御ボタン群
│   ├── SVG配管図
│   │   ├── 配管（path要素）
│   │   ├── バルブ（circle + text要素）
│   │   ├── タンク（rect + text要素）
│   │   └── 接続点（circle要素）
│   └── 凡例・サマリー
└── ハンドラ
    ├── toggleValve(id)
    ├── toggleTank(id)
    └── setAllValves(state)
```

### 6.3 サンプルデータ定義

```javascript
// ノード定義例
const nodes = [
  { id: 'i1', x: 30, y: 420, label: '液体A\n(液張)', type: 'inlet' },
  { id: 'n1', x: 80, y: 380 },  // 接続点（typeなし）
  { id: 't1', x: 620, y: 400, label: 'T-1', type: 'tank' },
  // ...
];

// 配管定義例
const pipes = [
  { id: 'p1', from: 'i1', to: 'n1', valveId: null },  // バルブなし
  { id: 'p2', from: 'n1', to: 'n2', valveId: 'v17' },  // バルブv17あり
  // ...
];

// 初期状態
const initialValves = { 'v5': false, 'v8': false, 'v17': false, /* ... */ };
const initialTankFilled = {
  'i1': true,      // 入口は常にtrue
  't1': false,     // 初期は空
  // ...
};
```

---

## 7. SVG作成ガイドライン

### 7.1 draw.ioでの作成手順

1. https://app.diagrams.net/ を開く
2. 元のP&ID画像を背景として配置
3. 配管を**バルブで区切った区間ごと**に線で描く
4. 各要素にID命名規則に従って名前を付ける
5. SVGとしてエクスポート

### 7.2 命名規則

| 要素 | 命名規則 | 例 |
|------|----------|-----|
| 接続点 | `n{番号}` | `n1`, `n2`, `n15` |
| タンク | `t{番号}` | `t1`, `t2`, `t3` |
| 配管 | `p{番号}` | `p1`, `p2`, `p10` |
| バルブ | `v{番号}` | `v1`, `v17`, `v31` |
| 入口 | `i{番号}` | `i1`, `i2` |
| 出口 | `o{番号}` | `o1`, `o2` |

### 7.3 座標の抽出

SVGエクスポート後、以下の情報を抽出してコードに反映：
- 各ノードの (x, y) 座標
- 配管の from/to 接続関係
- バルブの配置位置（配管の中点に自動配置も可）

---

## 8. 教育機能仕様

### 8.1 概要

P&IDシミュレーターを教育ソフトに拡張し、運転手順の訓練・評価を可能にする。

```
┌─────────────────────────────────────────┐
│  フェーズ: [準備] → [運転] → [停止]      │
├─────────────────────────────────────────┤
│  現在のステップ: 準備-3「液張りライン開放」│
│  → 操作指示が表示される                  │
├─────────────────────────────────────────┤
│            [P&ID図]                     │
│   バルブ操作 → ルール違反時にエラー表示   │
├─────────────────────────────────────────┤
│  ⚠️ エラー: バルブ1を先に開けてください   │
│           （供給元が確保されていません）  │
└─────────────────────────────────────────┘
```

### 8.2 フェーズ・ステップ構造

```
フェーズ（Phase）
├── 準備（preparation）
│   ├── ステップ1: 初期状態確認
│   ├── ステップ2: 供給ライン開放
│   └── ステップ3: ...
├── 運転（operation）
│   ├── ステップ1: ...
│   └── ステップ2: ...
└── 停止（shutdown）
    ├── ステップ1: ...
    └── ステップ2: ...
```

### 8.3 データ構造

#### 8.3.1 フェーズ定義（phases.csv）

```csv
phase_id,phase_name,order
preparation,準備,1
operation,運転,2
shutdown,停止,3
```

| カラム | 型 | 説明 |
|--------|-----|------|
| phase_id | string | フェーズの一意ID |
| phase_name | string | 表示名 |
| order | number | 表示順序 |

#### 8.3.2 ステップ定義（steps.csv）

```csv
phase_id,step_id,step_name,description,instruction,condition,order
preparation,prep-1,初期状態確認,全バルブ閉確認,全バルブが閉じていることを確認,ALL_VALVES_CLOSED,1
preparation,prep-2,供給ライン開放,バルブ1を開ける,バルブ1を開けてください,V1=OPEN,2
```

| カラム | 型 | 説明 |
|--------|-----|------|
| phase_id | string | 所属フェーズID |
| step_id | string | ステップの一意ID |
| step_name | string | ステップ名 |
| description | string | 説明（ステップ一覧に表示） |
| instruction | string | 操作指示（メイン画面に表示） |
| condition | string | 完了条件（条件式） |
| order | number | フェーズ内での順序 |

#### 8.3.3 安全ルール定義（rules.csv）

```csv
rule_id,rule_name,condition,error_message,severity,phases
rule-001,供給元未開放,OPENING:V2+ AND V1=CLOSED,バルブ1を先に開けてください,warning,all
rule-002,空タンク送液,OPENING:V6 AND T1=EMPTY,T-1が空です,critical,all
```

| カラム | 型 | 説明 |
|--------|-----|------|
| rule_id | string | ルールの一意ID |
| rule_name | string | ルール名 |
| condition | string | 違反条件（条件式） |
| error_message | string | エラーメッセージ |
| severity | string | 重要度（critical / warning） |
| phases | string | 適用フェーズ（all または phase_id をセミコロン区切り） |

### 8.4 条件式文法

ステップの完了条件およびルールの違反条件に使用する条件式の文法。

#### 8.4.1 基本条件

| 条件式 | 意味 |
|--------|------|
| `V1=OPEN` | バルブ1が開いている |
| `V1=CLOSED` | バルブ1が閉じている |
| `T1=FILLED` | タンクT-1に液がある |
| `T1=EMPTY` | タンクT-1が空 |
| `ALL_VALVES_CLOSED` | 全バルブが閉じている |
| `ALL_VALVES_OPEN` | 全バルブが開いている |

#### 8.4.2 アクション条件（ルール用）

| 条件式 | 意味 |
|--------|------|
| `OPENING:V2` | バルブ2を開けようとしている |
| `CLOSING:V1` | バルブ1を閉じようとしている |
| `OPENING:V2+` | バルブ2以上（V2, V3, V4...）を開けようとしている |

#### 8.4.3 複合条件

```
V1=OPEN AND V2=OPEN     // V1とV2の両方が開
V1=OPEN OR V2=OPEN      // V1またはV2が開
OPENING:V6 AND T1=EMPTY // V6を開けようとしていて、かつT-1が空
```

### 8.5 ルールチェックロジック

```
【アルゴリズム: ルール違反チェック】

入力:
  - action: 実行しようとしている操作（type: open_valve/close_valve, target: バルブID）
  - state: 現在の状態（valves, tanks）
  - rules: ルール定義リスト
  - currentPhase: 現在のフェーズID

出力:
  - violations: 違反したルールのリスト

手順:
1. violations = []

2. FOR each rule IN rules:
     // フェーズフィルター
     IF rule.phases != 'all':
       IF currentPhase NOT IN rule.phases.split(';'):
         CONTINUE
     
     // 条件評価
     IF evaluateCondition(rule.condition, state, action) == true:
       violations.push({
         id: rule.rule_id,
         name: rule.rule_name,
         message: rule.error_message,
         severity: rule.severity
       })

3. RETURN violations
```

### 8.6 重要度（Severity）による動作

| severity | 動作 |
|----------|------|
| `critical` | 操作を**阻止**する。エラーメッセージを表示。 |
| `warning` | 操作は**許可**する。警告メッセージを表示。 |

### 8.7 訓練モード / 自由モード

| モード | 説明 |
|--------|------|
| 訓練モード | ステップに従って操作。ルールチェックあり。 |
| 自由モード | 自由に操作可能。ルールチェックなし。 |

### 8.8 CSV設定UI

#### 8.8.1 機能一覧

| 機能 | 説明 |
|------|------|
| 直接編集 | テキストエリアでCSVを直接編集 |
| 適用 | 編集内容をシミュレーターに反映 |
| インポート | CSVファイルを読み込み |
| コピー | 現在のデータをクリップボードにコピー |
| 全て適用して閉じる | 3つのCSVを一括適用 |

#### 8.8.2 バリデーション

適用時に以下を検証：
- phases.csv: `phase_id`, `phase_name`, `order` が存在するか
- steps.csv: `phase_id`, `step_id`, `condition` が存在するか
- rules.csv: `rule_id`, `condition` が存在するか

エラー時はエラーメッセージを表示し、適用しない。

---

## 9. 拡張仕様（将来）

### 9.1 検討中の機能

| 機能 | 説明 |
|------|------|
| 流量表示 | 配管ごとの流量を数値/アニメーションで表示 |
| 操作手順記録 | バルブ操作の順序を記録・再生 |
| 複数液種対応 | 異なる液体を色分けして表示 |
| アラーム機能 | 禁止操作時の警告表示 |
| 設定保存/読込 | バルブ・タンク状態のプリセット保存 |

---

## 10. 用語集

| 用語 | 説明 |
|------|------|
| P&ID | Piping and Instrumentation Diagram（配管計装図） |
| DCS | Distributed Control System（分散制御システム） |
| 液源 | 液体の供給元となるノード |
| 端 | ネットワークの端点（液源と同義で使用） |
| 通液 | 配管内を液体が流れている状態 |
| BFS | Breadth-First Search（幅優先探索） |

---

## 11. 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | - | 初版：基本的なバルブ操作と配管可視化 |
| v2.0 | - | 液源からの到達判定ロジック追加 |
| v3.0 | - | 途中タンクの通過制御ロジック追加 |
| v4.0 | - | 教育機能追加（フェーズ/ステップ、安全ルール、CSV設定） |

---

## 12. 参考：最小実装コード

以下は、上記仕様を実装した最小限のReactコードの構造です。

```javascript
import React, { useState, useMemo } from 'react';

// データ定義
const nodes = [/* ... */];
const pipes = [/* ... */];

export default function PIDSimulator() {
  // 状態
  const [valves, setValves] = useState({/* 初期値 */});
  const [tankFilled, setTankFilled] = useState({/* 初期値 */});

  // 到達判定（BFS）
  const reachableNodes = useMemo(() => {
    const reachable = new Set();
    const queue = [];
    
    // 液源を起点に追加
    Object.entries(tankFilled).forEach(([id, filled]) => {
      if (filled) {
        reachable.add(id);
        queue.push(id);
      }
    });

    // BFS
    while (queue.length > 0) {
      const current = queue.shift();
      pipes.forEach(pipe => {
        const canPass = pipe.valveId === null || valves[pipe.valveId];
        if (!canPass) return;
        
        let next = null;
        if (pipe.from === current) next = pipe.to;
        if (pipe.to === current) next = pipe.from;
        if (!next || reachable.has(next)) return;
        
        // 空タンクからは進めない
        const currentNode = nodes.find(n => n.id === current);
        if (currentNode?.type === 'tank' && !tankFilled[current]) return;
        
        reachable.add(next);
        queue.push(next);
      });
    }
    return reachable;
  }, [valves, tankFilled]);

  // 配管通液判定
  const isPipeActive = (pipe) => {
    const canPass = pipe.valveId === null || valves[pipe.valveId];
    return canPass && reachableNodes.has(pipe.from) && reachableNodes.has(pipe.to);
  };

  // UIレンダリング
  return (
    <div>
      {/* バルブ/タンク制御UI */}
      {/* SVG配管図 */}
    </div>
  );
}
```

---

## 13. チェックリスト

実装時の確認項目：

### 基本機能
- [ ] 全バルブ閉状態で液源のみ水色になるか
- [ ] バルブを順に開けると配管が水色に変わるか
- [ ] 空タンクで液の流れが止まるか
- [ ] 液ありタンクから液が流れ出すか
- [ ] 図上のバルブクリックで操作できるか
- [ ] 図上のタンククリックで状態切替できるか
- [ ] 全開/全閉ボタンが機能するか

### 教育機能
- [ ] フェーズが正しく表示されるか
- [ ] ステップの指示が表示されるか
- [ ] ステップ完了条件が正しく判定されるか
- [ ] 次のステップへ進めるか
- [ ] 安全ルール違反時にエラーが表示されるか
- [ ] critical違反時に操作が阻止されるか
- [ ] warning違反時に操作が許可されるか
- [ ] 訓練モード/自由モードの切り替えが機能するか

### CSV設定機能
- [ ] CSV設定パネルが開くか
- [ ] テキストエリアで直接編集できるか
- [ ] 「適用」で変更が反映されるか
- [ ] CSVファイルのインポートができるか
- [ ] クリップボードへのコピーができるか
- [ ] バリデーションエラーが表示されるか
