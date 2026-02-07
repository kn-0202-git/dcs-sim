import { describe, it, expect } from 'vitest';
import { isPipeActive } from '../isPipeActive';
import type { Pipe, ValveState } from '../../types';

const makePipe = (from: string, to: string, valveId: number | null): Pipe => ({
  id: `${from}-${to}`, from, to, valveId,
});

describe('isPipeActive', () => {
  describe('バルブ開 + 両端到達', () => {
    it('バルブ開で両端が到達済みならtrue', () => {
      const pipe = makePipe('a', 'b', 1);
      const valves: ValveState = { 1: true };
      const reachable = new Set(['a', 'b']);
      expect(isPipeActive(pipe, valves, reachable)).toBe(true);
    });
  });

  describe('バルブなし', () => {
    it('valveIdがnullで両端到達ならtrue', () => {
      const pipe = makePipe('a', 'b', null);
      const reachable = new Set(['a', 'b']);
      expect(isPipeActive(pipe, {}, reachable)).toBe(true);
    });
  });

  describe('バルブ閉', () => {
    it('バルブ閉ならfalse', () => {
      const pipe = makePipe('a', 'b', 1);
      const valves: ValveState = { 1: false };
      const reachable = new Set(['a', 'b']);
      expect(isPipeActive(pipe, valves, reachable)).toBe(false);
    });
  });

  describe('片端のみ到達', () => {
    it('from側のみ到達ならfalse', () => {
      const pipe = makePipe('a', 'b', 1);
      const valves: ValveState = { 1: true };
      const reachable = new Set(['a']);
      expect(isPipeActive(pipe, valves, reachable)).toBe(false);
    });

    it('to側のみ到達ならfalse', () => {
      const pipe = makePipe('a', 'b', 1);
      const valves: ValveState = { 1: true };
      const reachable = new Set(['b']);
      expect(isPipeActive(pipe, valves, reachable)).toBe(false);
    });
  });

  describe('両端未到達', () => {
    it('どちらも未到達ならfalse', () => {
      const pipe = makePipe('a', 'b', 1);
      const valves: ValveState = { 1: true };
      const reachable = new Set<string>();
      expect(isPipeActive(pipe, valves, reachable)).toBe(false);
    });
  });

  describe('未定義バルブ', () => {
    it('valvesにIDが存在しない場合はfalse（undefinedはtrueでない）', () => {
      const pipe = makePipe('a', 'b', 99);
      const valves: ValveState = {};
      const reachable = new Set(['a', 'b']);
      expect(isPipeActive(pipe, valves, reachable)).toBe(false);
    });
  });
});
