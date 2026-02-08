import { describe, it, expect, vi } from 'vitest';
import { evaluateCondition } from '../conditionEvaluator';
import type { SimulatorState, ValveAction } from '../types';

// ヘルパー: 最小限のステートを作成
const makeState = (
  valves: Record<number, boolean> = {},
  tanks: Record<string, boolean> = {},
): SimulatorState => ({ valves, tanks });

describe('evaluateCondition', () => {
  describe('空・不明条件', () => {
    it('空文字列はtrueを返す', () => {
      expect(evaluateCondition('', makeState())).toBe(true);
    });

    it('不明な条件はfalseを返し、console.warnが呼ばれる（fail-safe）', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(evaluateCondition('UNKNOWN_CONDITION', makeState())).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith('Unknown condition:', 'UNKNOWN_CONDITION');
      warnSpy.mockRestore();
    });
  });

  describe('バルブ条件', () => {
    it('V1=OPEN: バルブ1が開のときtrue', () => {
      expect(evaluateCondition('V1=OPEN', makeState({ 1: true }))).toBe(true);
    });

    it('V1=OPEN: バルブ1が閉のときfalse', () => {
      expect(evaluateCondition('V1=OPEN', makeState({ 1: false }))).toBe(false);
    });

    it('V1=CLOSED: バルブ1が閉のときtrue', () => {
      expect(evaluateCondition('V1=CLOSED', makeState({ 1: false }))).toBe(true);
    });

    it('V1=CLOSED: バルブ1が開のときfalse', () => {
      expect(evaluateCondition('V1=CLOSED', makeState({ 1: true }))).toBe(false);
    });

    it('V8=OPEN: 大きい番号のバルブも正しく評価', () => {
      expect(evaluateCondition('V8=OPEN', makeState({ 8: true }))).toBe(true);
    });
  });

  describe('タンク条件', () => {
    it('T1=FILLED: tank-T1が満のときtrue', () => {
      expect(evaluateCondition('T1=FILLED', makeState({}, { 'tank-T1': true }))).toBe(true);
    });

    it('T1=FILLED: tank-T1が空のときfalse', () => {
      expect(evaluateCondition('T1=FILLED', makeState({}, { 'tank-T1': false }))).toBe(false);
    });

    it('T1=EMPTY: tank-T1が空のときtrue', () => {
      expect(evaluateCondition('T1=EMPTY', makeState({}, { 'tank-T1': false }))).toBe(true);
    });

    it('T2=FILLED: tank-T2が満のときtrue', () => {
      expect(evaluateCondition('T2=FILLED', makeState({}, { 'tank-T2': true }))).toBe(true);
    });
  });

  describe('特殊条件', () => {
    it('ALL_VALVES_CLOSED: 全バルブ閉のときtrue', () => {
      expect(
        evaluateCondition('ALL_VALVES_CLOSED', makeState({ 1: false, 2: false, 3: false }), null, [1, 2, 3]),
      ).toBe(true);
    });

    it('ALL_VALVES_CLOSED: 1つでも開いているとfalse', () => {
      expect(
        evaluateCondition('ALL_VALVES_CLOSED', makeState({ 1: false, 2: true, 3: false }), null, [1, 2, 3]),
      ).toBe(false);
    });

    it('ALL_VALVES_OPEN: 全バルブ開のときtrue', () => {
      expect(
        evaluateCondition('ALL_VALVES_OPEN', makeState({ 1: true, 2: true }), null, [1, 2]),
      ).toBe(true);
    });

    it('ALL_VALVES_OPEN: 1つでも閉じているとfalse', () => {
      expect(
        evaluateCondition('ALL_VALVES_OPEN', makeState({ 1: true, 2: false }), null, [1, 2]),
      ).toBe(false);
    });
  });

  describe('アクション条件', () => {
    it('OPENING:V2: open_valveでtarget=2のときtrue', () => {
      const action: ValveAction = { type: 'open_valve', target: 2 };
      expect(evaluateCondition('OPENING:V2', makeState(), action)).toBe(true);
    });

    it('OPENING:V2: open_valveでtarget=3のときfalse', () => {
      const action: ValveAction = { type: 'open_valve', target: 3 };
      expect(evaluateCondition('OPENING:V2', makeState(), action)).toBe(false);
    });

    it('OPENING:V2: actionがnullのときfalse', () => {
      expect(evaluateCondition('OPENING:V2', makeState(), null)).toBe(false);
    });

    it('OPENING:V2+: target>=2のときtrue', () => {
      const action: ValveAction = { type: 'open_valve', target: 5 };
      expect(evaluateCondition('OPENING:V2+', makeState(), action)).toBe(true);
    });

    it('OPENING:V2+: target=2のときtrue', () => {
      const action: ValveAction = { type: 'open_valve', target: 2 };
      expect(evaluateCondition('OPENING:V2+', makeState(), action)).toBe(true);
    });

    it('OPENING:V2+: target=1のときfalse', () => {
      const action: ValveAction = { type: 'open_valve', target: 1 };
      expect(evaluateCondition('OPENING:V2+', makeState(), action)).toBe(false);
    });

    it('CLOSING:V1: close_valveでtarget=1のときtrue', () => {
      const action: ValveAction = { type: 'close_valve', target: 1 };
      expect(evaluateCondition('CLOSING:V1', makeState(), action)).toBe(true);
    });

    it('CLOSING:V1: open_valveでtarget=1のときfalse', () => {
      const action: ValveAction = { type: 'open_valve', target: 1 };
      expect(evaluateCondition('CLOSING:V1', makeState(), action)).toBe(false);
    });
  });

  describe('ANDコンビネータ', () => {
    it('V1=OPEN AND V2=OPEN: 両方trueならtrue', () => {
      expect(evaluateCondition('V1=OPEN AND V2=OPEN', makeState({ 1: true, 2: true }))).toBe(true);
    });

    it('V1=OPEN AND V2=OPEN: 片方falseならfalse', () => {
      expect(evaluateCondition('V1=OPEN AND V2=OPEN', makeState({ 1: true, 2: false }))).toBe(false);
    });

    it('V1=OPEN AND V2=OPEN AND V3=OPEN: 3条件すべてtrue', () => {
      expect(
        evaluateCondition('V1=OPEN AND V2=OPEN AND V3=OPEN', makeState({ 1: true, 2: true, 3: true })),
      ).toBe(true);
    });
  });

  describe('ORコンビネータ', () => {
    it('V1=OPEN OR V2=OPEN: 片方trueならtrue', () => {
      expect(evaluateCondition('V1=OPEN OR V2=OPEN', makeState({ 1: false, 2: true }))).toBe(true);
    });

    it('V1=OPEN OR V2=OPEN: 両方falseならfalse', () => {
      expect(evaluateCondition('V1=OPEN OR V2=OPEN', makeState({ 1: false, 2: false }))).toBe(false);
    });
  });

  describe('複合条件', () => {
    it('OPENING:V2+ AND V1=CLOSED: アクション条件+バルブ条件', () => {
      const action: ValveAction = { type: 'open_valve', target: 3 };
      expect(evaluateCondition('OPENING:V2+ AND V1=CLOSED', makeState({ 1: false }), action)).toBe(true);
    });

    it('OPENING:V6 AND T1=EMPTY: rule-002シナリオ', () => {
      const action: ValveAction = { type: 'open_valve', target: 6 };
      expect(
        evaluateCondition('OPENING:V6 AND T1=EMPTY', makeState({}, { 'tank-T1': false }), action),
      ).toBe(true);
    });

    it('OPENING:V6 AND T1=EMPTY: T1が満のときfalse', () => {
      const action: ValveAction = { type: 'open_valve', target: 6 };
      expect(
        evaluateCondition('OPENING:V6 AND T1=EMPTY', makeState({}, { 'tank-T1': true }), action),
      ).toBe(false);
    });
  });
});
