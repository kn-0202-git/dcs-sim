import { describe, it, expect } from 'vitest';
import type { PIDNode, Valve } from '../../types';
import { deriveHelpers } from '../deriveHelpers';

describe('deriveHelpers', () => {
  const nodes: PIDNode[] = [
    { id: 'input', x: 0, y: 0, type: 'input' },
    { id: 'tank-A', x: 10, y: 10, type: 'tank', tankId: 2 },
    { id: 'n1', x: 20, y: 20 },
    { id: 'tank-B', x: 30, y: 30, type: 'tank', tankId: 1 },
    { id: 'outlet', x: 40, y: 40, type: 'outlet' },
  ];
  const valves: Valve[] = [
    { id: 2, pipeId: 'p2' },
    { id: 1, pipeId: 'p1' },
  ];

  const derived = deriveHelpers(nodes, valves);

  it('allValveIds を昇順で導出する', () => {
    expect(derived.allValveIds).toEqual([1, 2]);
  });

  it('valveMap が全バルブを含む', () => {
    expect(derived.valveMap.size).toBe(valves.length);
    expect(derived.valveMap.get(1)).toEqual({ id: 1, pipeId: 'p1' });
  });

  it('pipeToValveMap が pipeId をキーに持つ', () => {
    expect(derived.pipeToValveMap.get('p2')).toEqual({ id: 2, pipeId: 'p2' });
  });

  it('allTankIds が tank ノードのみを含む', () => {
    expect(derived.allTankIds).toEqual(['tank-A', 'tank-B']);
  });

  it('tankIdMap が tankId から T{n} を生成する', () => {
    expect(derived.tankIdMap).toEqual({ T2: 'tank-A', T1: 'tank-B' });
  });

  it('initialValves が全バルブ閉で初期化される', () => {
    expect(derived.initialValves).toEqual({ 1: false, 2: false });
  });

  it('initialTankFilled が input true / tank false で初期化される', () => {
    expect(derived.initialTankFilled).toEqual({
      input: true,
      'tank-A': false,
      'tank-B': false,
    });
  });

  it('nodeMap に全ノードが含まれる', () => {
    expect(Object.keys(derived.nodeMap)).toHaveLength(nodes.length);
    expect(derived.nodeMap['n1']).toEqual(nodes[2]);
  });
});
