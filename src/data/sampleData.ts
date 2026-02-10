import type { PIDNode, Pipe, Valve, ValveState, TankFilledState } from '../types';

export const nodes: PIDNode[] = [
  { id: 'input', x: 50, y: 200, label: '液体A\n(供給)', type: 'input' },
  { id: 'n1', x: 130, y: 200 },
  { id: 'n2', x: 210, y: 200 },
  { id: 'n3', x: 290, y: 200 },
  { id: 'n4', x: 290, y: 280 },
  { id: 'tank-T1', x: 370, y: 200, label: 'T-1', type: 'tank', tankId: 1 },
  { id: 'tank-T2', x: 370, y: 280, label: 'T-2', type: 'tank', tankId: 2 },
  { id: 'n5', x: 450, y: 240 },
  { id: 'outlet', x: 530, y: 240, label: '出口', type: 'outlet' },
];

export const pipes: Pipe[] = [
  { id: 'p1', from: 'input', to: 'n1', valveId: null },
  { id: 'p2', from: 'n1', to: 'n2', valveId: 1 },
  { id: 'p3', from: 'n2', to: 'n3', valveId: 2 },
  { id: 'p4', from: 'n3', to: 'tank-T1', valveId: 3 },
  { id: 'p5', from: 'n2', to: 'n4', valveId: 4 },
  { id: 'p6', from: 'n4', to: 'tank-T2', valveId: 5 },
  { id: 'p7', from: 'tank-T1', to: 'n5', valveId: 6 },
  { id: 'p8', from: 'tank-T2', to: 'n5', valveId: 7 },
  { id: 'p9', from: 'n5', to: 'outlet', valveId: 8 },
];

// --- バルブ独立定義 ---

export const valves: Valve[] = [
  { id: 1, pipeId: 'p2' },
  { id: 2, pipeId: 'p3' },
  { id: 3, pipeId: 'p4' },
  { id: 4, pipeId: 'p5' },
  { id: 5, pipeId: 'p6' },
  { id: 6, pipeId: 'p7' },
  { id: 7, pipeId: 'p8' },
  { id: 8, pipeId: 'p9' },
];

// --- 以下すべて nodes/pipes/valves から自動導出 ---

export const valveMap: ReadonlyMap<number, Valve> = new Map(
  valves.map(v => [v.id, v])
);

export const pipeToValveMap: ReadonlyMap<string, Valve> = new Map(
  valves.map(v => [v.pipeId, v])
);

export const allValveIds: number[] = valves.map(v => v.id).sort((a, b) => a - b);

export const allTankIds: string[] = nodes
  .filter(n => n.type === 'tank')
  .map(n => n.id);

export const nodeMap: Record<string, PIDNode> = Object.fromEntries(
  nodes.map(n => [n.id, n])
);

// CSV条件式の短縮名（T1, T2, ...）→ ノードID のマッピング
// タンクの nodes 配列出現順で番号付け
export const tankIdMap: Record<string, string> = Object.fromEntries(
  nodes
    .filter(n => n.type === 'tank' && n.tankId != null)
    .map(n => [`T${n.tankId}`, n.id])
);

export const initialValves: ValveState = Object.fromEntries(
  allValveIds.map(id => [id, false])
);

// source は液あり、tank は空で初期化
export const initialTankFilled: TankFilledState = Object.fromEntries(
  nodes
    .filter(n => n.type === 'input' || n.type === 'tank')
    .map(n => [n.id, n.type === 'input'])
);
