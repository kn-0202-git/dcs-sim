import type { PIDNode, Pipe, Valve } from '../types';
import { deriveHelpers } from './deriveHelpers';

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
  { id: 'p1', from: 'input', to: 'n1' },
  { id: 'p2', from: 'n1', to: 'n2' },
  { id: 'p3', from: 'n2', to: 'n3' },
  { id: 'p4', from: 'n3', to: 'tank-T1' },
  { id: 'p5', from: 'n2', to: 'n4' },
  { id: 'p6', from: 'n4', to: 'tank-T2' },
  { id: 'p7', from: 'tank-T1', to: 'n5' },
  { id: 'p8', from: 'tank-T2', to: 'n5' },
  { id: 'p9', from: 'n5', to: 'outlet' },
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

const derived = deriveHelpers(nodes, valves);

export const valveMap = derived.valveMap;
export const pipeToValveMap = derived.pipeToValveMap;
export const allValveIds = derived.allValveIds;
export const allTankIds = derived.allTankIds;
export const nodeMap = derived.nodeMap;
export const tankIdMap = derived.tankIdMap;
export const initialValves = derived.initialValves;
export const initialTankFilled = derived.initialTankFilled;
