import type { PIDNode, Pipe, ValveState, TankFilledState } from '../types';

export const nodes: PIDNode[] = [
  { id: 'source', x: 50, y: 200, label: '液体A\n(供給)', type: 'source' },
  { id: 'n1', x: 130, y: 200 },
  { id: 'n2', x: 210, y: 200 },
  { id: 'n3', x: 290, y: 200 },
  { id: 'n4', x: 290, y: 280 },
  { id: 'tank-T1', x: 370, y: 200, label: 'T-1', type: 'tank' },
  { id: 'tank-T2', x: 370, y: 280, label: 'T-2', type: 'tank' },
  { id: 'n5', x: 450, y: 240 },
  { id: 'outlet', x: 530, y: 240, label: '出口', type: 'outlet' },
];

export const pipes: Pipe[] = [
  { id: 'p1', from: 'source', to: 'n1', valveId: null },
  { id: 'p2', from: 'n1', to: 'n2', valveId: 1 },
  { id: 'p3', from: 'n2', to: 'n3', valveId: 2 },
  { id: 'p4', from: 'n3', to: 'tank-T1', valveId: 3 },
  { id: 'p5', from: 'n2', to: 'n4', valveId: 4 },
  { id: 'p6', from: 'n4', to: 'tank-T2', valveId: 5 },
  { id: 'p7', from: 'tank-T1', to: 'n5', valveId: 6 },
  { id: 'p8', from: 'tank-T2', to: 'n5', valveId: 7 },
  { id: 'p9', from: 'n5', to: 'outlet', valveId: 8 },
];

export const allValveIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
export const allTankIds: string[] = ['tank-T1', 'tank-T2'];

export const nodeMap: Record<string, PIDNode> = {};
nodes.forEach(n => { nodeMap[n.id] = n; });

export const initialValves: ValveState = Object.fromEntries(
  allValveIds.map(id => [id, false])
);

export const initialTankFilled: TankFilledState = {
  'source': true,
  'tank-T1': false,
  'tank-T2': false,
};
