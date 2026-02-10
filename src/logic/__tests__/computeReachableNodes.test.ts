import { describe, it, expect } from 'vitest';
import { computeReachableNodes } from '../computeReachableNodes';
import type { PIDNode, Pipe, Valve, ValveState, TankFilledState } from '../../types';

// --- ヘルパー: テスト用の小さなトポロジーを作成 ---
const makeNode = (id: string, type?: PIDNode['type']): PIDNode => ({
  id, x: 0, y: 0, type,
});

const makePipe = (id: string, from: string, to: string, valveId: number | null): Pipe => ({
  id, from, to, valveId,
});

// pipeId→Valve マップを構築（テスト用）
const buildPipeToValveMap = (pipes: Pipe[]): ReadonlyMap<string, Valve> =>
  new Map(
    pipes
      .filter(p => p.valveId !== null)
      .map(p => [p.id, { id: p.valveId!, pipeId: p.id }])
  );

const emptyPipeToValveMap = new Map<string, Valve>();

// --- サンプルデータのトポロジーを使ったテスト ---
// input → n1 (V1) → n2 (V2) → n3 (V3) → tank-T1 (V6) → n5 (V8) → outlet
//                        ↓ (V4)
//                        n4 (V5) → tank-T2 (V7) → n5
const sampleNodes: PIDNode[] = [
  makeNode('input', 'input'),
  makeNode('n1'),
  makeNode('n2'),
  makeNode('n3'),
  makeNode('n4'),
  makeNode('tank-T1', 'tank'),
  makeNode('tank-T2', 'tank'),
  makeNode('n5'),
  makeNode('outlet', 'outlet'),
];

const samplePipes: Pipe[] = [
  makePipe('p1', 'input', 'n1', null),
  makePipe('p2', 'n1', 'n2', 1),
  makePipe('p3', 'n2', 'n3', 2),
  makePipe('p4', 'n3', 'tank-T1', 3),
  makePipe('p5', 'n2', 'n4', 4),
  makePipe('p6', 'n4', 'tank-T2', 5),
  makePipe('p7', 'tank-T1', 'n5', 6),
  makePipe('p8', 'tank-T2', 'n5', 7),
  makePipe('p9', 'n5', 'outlet', 8),
];

const samplePipeToValveMap = buildPipeToValveMap(samplePipes);

const allClosed: ValveState = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
const allOpen: ValveState = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true };

describe('computeReachableNodes', () => {
  describe('全バルブ閉', () => {
    it('inputのみ到達可能（p1にバルブなし→n1も到達）', () => {
      const tankFilled: TankFilledState = { input: true, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, allClosed, tankFilled, samplePipeToValveMap);
      expect(result).toContain('input');
      expect(result).toContain('n1'); // p1にバルブなし
      expect(result).not.toContain('n2');
      expect(result).not.toContain('tank-T1');
    });
  });

  describe('単一パスの開通', () => {
    it('V1,V2,V3を開くとinput→n1→n2→n3→tank-T1が到達', () => {
      const valves: ValveState = { ...allClosed, 1: true, 2: true, 3: true };
      const tankFilled: TankFilledState = { input: true, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, valves, tankFilled, samplePipeToValveMap);
      expect(result).toContain('input');
      expect(result).toContain('n1');
      expect(result).toContain('n2');
      expect(result).toContain('n3');
      expect(result).toContain('tank-T1');
      expect(result).not.toContain('n4');
      expect(result).not.toContain('tank-T2');
      expect(result).not.toContain('n5');
    });
  });

  describe('分岐パス', () => {
    it('V1,V2,V4,V5を開くとtank-T2方面も到達', () => {
      const valves: ValveState = { ...allClosed, 1: true, 2: true, 4: true, 5: true };
      const tankFilled: TankFilledState = { input: true, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, valves, tankFilled, samplePipeToValveMap);
      expect(result).toContain('n4');
      expect(result).toContain('tank-T2');
      expect(result).toContain('n3'); // V2が開なのでn2→n3は通る
      expect(result).not.toContain('tank-T1'); // V3は閉なのでtank-T1には到達しない
    });

    it('V1,V2,V3,V4,V5を開くと両タンクに到達', () => {
      const valves: ValveState = { ...allClosed, 1: true, 2: true, 3: true, 4: true, 5: true };
      const tankFilled: TankFilledState = { input: true, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, valves, tankFilled, samplePipeToValveMap);
      expect(result).toContain('tank-T1');
      expect(result).toContain('tank-T2');
    });
  });

  describe('空タンクによる遮断', () => {
    it('tank-T1が空のとき、T1到達後もn5へは進めない', () => {
      const valves: ValveState = { ...allClosed, 1: true, 2: true, 3: true, 6: true, 8: true };
      const tankFilled: TankFilledState = { input: true, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, valves, tankFilled, samplePipeToValveMap);
      expect(result).toContain('tank-T1');
      expect(result).not.toContain('n5'); // 空タンクが遮断
      expect(result).not.toContain('outlet');
    });

    it('tank-T1が満のとき、T1経由でn5→outletに到達', () => {
      const valves: ValveState = { ...allClosed, 1: true, 2: true, 3: true, 6: true, 8: true };
      const tankFilled: TankFilledState = { input: true, 'tank-T1': true, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, valves, tankFilled, samplePipeToValveMap);
      expect(result).toContain('tank-T1');
      expect(result).toContain('n5');
      expect(result).toContain('outlet');
    });
  });

  describe('全開・全満', () => {
    it('全バルブ開・全タンク満で全ノード到達', () => {
      const tankFilled: TankFilledState = { input: true, 'tank-T1': true, 'tank-T2': true };
      const result = computeReachableNodes(sampleNodes, samplePipes, allOpen, tankFilled, samplePipeToValveMap);
      for (const node of sampleNodes) {
        expect(result).toContain(node.id);
      }
    });
  });

  describe('inputが空', () => {
    it('inputが空ならどこにも到達しない', () => {
      const tankFilled: TankFilledState = { input: false, 'tank-T1': false, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, allOpen, tankFilled, samplePipeToValveMap);
      expect(result.size).toBe(0);
    });

    it('tank-T1だけ満ならT1のみ到達', () => {
      const tankFilled: TankFilledState = { input: false, 'tank-T1': true, 'tank-T2': false };
      const result = computeReachableNodes(sampleNodes, samplePipes, allOpen, tankFilled, samplePipeToValveMap);
      expect(result).toContain('tank-T1');
      expect(result).toContain('n5');
      expect(result).toContain('outlet');
      // T1から逆方向にも辿れる（双方向）
      expect(result).toContain('n3');
    });
  });

  describe('境界条件', () => {
    it('空のグラフ（ノードなし、パイプなし）', () => {
      const result = computeReachableNodes([], [], {}, {}, emptyPipeToValveMap);
      expect(result.size).toBe(0);
    });

    it('孤立ノード（パイプなし）', () => {
      const nodes = [makeNode('alone')];
      const tankFilled: TankFilledState = { alone: true };
      const result = computeReachableNodes(nodes, [], {}, tankFilled, emptyPipeToValveMap);
      expect(result.size).toBe(1);
      expect(result).toContain('alone');
    });

    it('2ノード・1パイプ（バルブなし）', () => {
      const nodes = [makeNode('a', 'input'), makeNode('b')];
      const pipes = [makePipe('p', 'a', 'b', null)];
      const tankFilled: TankFilledState = { a: true };
      const result = computeReachableNodes(nodes, pipes, {}, tankFilled, emptyPipeToValveMap);
      expect(result).toContain('a');
      expect(result).toContain('b');
    });
  });

  describe('双方向探索', () => {
    it('パイプは双方向に辿れる', () => {
      // A → B → C の直線。Cにタンク(満)を置き、Cから逆方向に辿れるか確認
      const nodes = [makeNode('a'), makeNode('b'), makeNode('c', 'tank')];
      const pipes = [
        makePipe('p1', 'a', 'b', null),
        makePipe('p2', 'b', 'c', null),
      ];
      const tankFilled: TankFilledState = { c: true };
      const result = computeReachableNodes(nodes, pipes, {}, tankFilled, emptyPipeToValveMap);
      expect(result).toContain('c');
      expect(result).toContain('b');
      expect(result).toContain('a');
    });
  });
});
