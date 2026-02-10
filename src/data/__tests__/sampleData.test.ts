import { describe, it, expect } from 'vitest';
import {
  nodes,
  pipes,
  valves,
  valveMap,
  pipeToValveMap,
  allValveIds,
  allTankIds,
  nodeMap,
  tankIdMap,
  initialValves,
  initialTankFilled,
} from '../sampleData';

describe('sampleData', () => {
  describe('valves 配列の整合性', () => {
    it('全バルブがユニークなIDを持つ', () => {
      const ids = valves.map(v => v.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('全バルブが存在するpipeIdを参照する', () => {
      const pipeIds = new Set(pipes.map(p => p.id));
      for (const valve of valves) {
        expect(pipeIds.has(valve.pipeId)).toBe(true);
      }
    });

    it('1つのパイプに複数バルブが割り当てられていない', () => {
      const pipeIds = valves.map(v => v.pipeId);
      expect(new Set(pipeIds).size).toBe(pipeIds.length);
    });
  });

  describe('導出ヘルパー', () => {
    it('allValveIds が valves[] から正しく導出される', () => {
      expect(allValveIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('valveMap が全バルブを含む', () => {
      expect(valveMap.size).toBe(valves.length);
      for (const valve of valves) {
        expect(valveMap.get(valve.id)).toEqual(valve);
      }
    });

    it('pipeToValveMap がバルブ付きパイプを正しくマッピングする', () => {
      expect(pipeToValveMap.size).toBe(valves.length);
      expect(pipeToValveMap.get('p2')?.id).toBe(1);
      expect(pipeToValveMap.get('p1')).toBeUndefined();
    });

    it('initialValves が全バルブ閉で初期化される', () => {
      for (const id of allValveIds) {
        expect(initialValves[id]).toBe(false);
      }
    });
  });

  describe('既存の導出値が変わらない', () => {
    it('allTankIds', () => {
      expect(allTankIds).toEqual(['tank-T1', 'tank-T2']);
    });

    it('tankIdMap', () => {
      expect(tankIdMap).toEqual({ T1: 'tank-T1', T2: 'tank-T2' });
    });

    it('nodeMap の全ノード', () => {
      expect(Object.keys(nodeMap)).toHaveLength(nodes.length);
    });

    it('initialTankFilled の初期状態', () => {
      expect(initialTankFilled['input']).toBe(true);
      expect(initialTankFilled['tank-T1']).toBe(false);
      expect(initialTankFilled['tank-T2']).toBe(false);
    });
  });
});
