import { describe, it, expect } from 'vitest';
import { isPipeActive } from '../isPipeActive';
import type { Pipe, Valve, ValveState } from '../../types';

const makePipe = (id: string, from: string, to: string): Pipe => ({
  id, from, to,
});

const makeValveMap = (...entries: Valve[]): ReadonlyMap<string, Valve> =>
  new Map(entries.map(v => [v.pipeId, v]));

describe('isPipeActive', () => {
  describe('バルブ開 + 両端到達', () => {
    it('バルブ開で両端が到達済みならtrue', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = { 1: true };
      const reachable = new Set(['a', 'b']);
      const map = makeValveMap({ id: 1, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(true);
    });
  });

  describe('バルブなし', () => {
    it('pipeToValveMapにエントリがなく両端到達ならtrue', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const reachable = new Set(['a', 'b']);
      const map = makeValveMap();
      expect(isPipeActive(pipe, {}, reachable, map)).toBe(true);
    });
  });

  describe('バルブ閉', () => {
    it('バルブ閉ならfalse', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = { 1: false };
      const reachable = new Set(['a', 'b']);
      const map = makeValveMap({ id: 1, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(false);
    });
  });

  describe('片端のみ到達', () => {
    it('from側のみ到達ならfalse', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = { 1: true };
      const reachable = new Set(['a']);
      const map = makeValveMap({ id: 1, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(false);
    });

    it('to側のみ到達ならfalse', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = { 1: true };
      const reachable = new Set(['b']);
      const map = makeValveMap({ id: 1, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(false);
    });
  });

  describe('両端未到達', () => {
    it('どちらも未到達ならfalse', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = { 1: true };
      const reachable = new Set<string>();
      const map = makeValveMap({ id: 1, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(false);
    });
  });

  describe('未定義バルブ', () => {
    it('valvesにIDが存在しない場合はfalse（undefinedはtrueでない）', () => {
      const pipe = makePipe('p1', 'a', 'b');
      const valves: ValveState = {};
      const reachable = new Set(['a', 'b']);
      const map = makeValveMap({ id: 99, pipeId: 'p1' });
      expect(isPipeActive(pipe, valves, reachable, map)).toBe(false);
    });
  });
});
