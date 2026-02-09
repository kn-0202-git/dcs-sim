import { describe, it, expect } from 'vitest';
import { validateTopology } from '../topologyValidator';
import type { PIDNode, Pipe } from '../../types';

const makeNode = (id: string, type?: PIDNode['type']): PIDNode => ({
  id, x: 0, y: 0, type,
});

const makePipe = (id: string, from: string, to: string, valveId: number | null): Pipe => ({
  id, from, to, valveId,
});

describe('validateTopology', () => {
  it('正常なトポロジーはvalid', () => {
    const nodes = [makeNode('a', 'input'), makeNode('b', 'tank')];
    const pipes = [makePipe('p1', 'a', 'b', 1)];
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('空のトポロジーはvalid', () => {
    const result = validateTopology([], []);
    expect(result.valid).toBe(true);
  });

  it('パイプのfromが存在しないノードを参照', () => {
    const nodes = [makeNode('a')];
    const pipes = [makePipe('p1', 'missing', 'a', null)];
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('from "missing"'));
  });

  it('パイプのtoが存在しないノードを参照', () => {
    const nodes = [makeNode('a')];
    const pipes = [makePipe('p1', 'a', 'missing', null)];
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('to "missing"'));
  });

  it('ノードID重複を検出', () => {
    const nodes = [makeNode('a'), makeNode('a')];
    const result = validateTopology(nodes, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('ノードID重複'));
  });

  it('パイプID重複を検出', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const pipes = [makePipe('p1', 'a', 'b', null), makePipe('p1', 'a', 'b', null)];
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('パイプID重複'));
  });

  it('バルブID重複を検出', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const pipes = [makePipe('p1', 'a', 'b', 1), makePipe('p2', 'b', 'c', 1)];
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('バルブID重複'));
  });

  it('複数エラーを同時に検出', () => {
    const nodes = [makeNode('a'), makeNode('a')]; // ノードID重複
    const pipes = [makePipe('p1', 'a', 'missing', 1)]; // 存在しないノード
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('タンクID重複を検出', () => {
    const nodes: PIDNode[] = [
      { id: 'a', x: 0, y: 0, type: 'tank', tankId: 1 },
      { id: 'b', x: 0, y: 0, type: 'tank', tankId: 1 },
    ];
    const result = validateTopology(nodes, []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('タンクID重複'));
  });

  it('タンクIDが異なればvalid', () => {
    const nodes: PIDNode[] = [
      { id: 'a', x: 0, y: 0, type: 'tank', tankId: 1 },
      { id: 'b', x: 0, y: 0, type: 'tank', tankId: 2 },
    ];
    const result = validateTopology(nodes, []);
    expect(result.valid).toBe(true);
  });

  it('sampleDataのトポロジーはvalid', async () => {
    const { nodes, pipes } = await import('../sampleData');
    const result = validateTopology(nodes, pipes);
    expect(result.valid).toBe(true);
  });
});
