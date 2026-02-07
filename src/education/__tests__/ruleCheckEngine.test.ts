import { describe, it, expect } from 'vitest';
import { checkRules } from '../ruleCheckEngine';
import { parseCSV, defaultRulesCSV } from '../csvParser';
import type { Rule, ValveAction, SimulatorState } from '../types';

// ヘルパー
const makeRule = (overrides: Partial<Rule> = {}): Rule => ({
  rule_id: 'test-rule',
  rule_name: 'テストルール',
  condition: 'OPENING:V1',
  error_message: 'テストエラー',
  severity: 'warning',
  phases: 'all',
  ...overrides,
});

const makeAction = (type: 'open_valve' | 'close_valve', target: number): ValveAction => ({
  type, target,
});

const makeState = (
  valves: Record<number, boolean> = {},
  tanks: Record<string, boolean> = {},
): SimulatorState => ({ valves, tanks });

describe('checkRules', () => {
  describe('基本動作', () => {
    it('条件がマッチしない場合は空配列を返す', () => {
      const rules = [makeRule({ condition: 'OPENING:V5' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'preparation', [1, 2, 3]);
      expect(result).toEqual([]);
    });

    it('条件がマッチした場合はViolationを返す', () => {
      const rules = [makeRule()];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'preparation', [1, 2, 3]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-rule');
      expect(result[0].name).toBe('テストルール');
      expect(result[0].message).toBe('テストエラー');
      expect(result[0].severity).toBe('warning');
    });

    it('Violationにtimestampが含まれる', () => {
      const rules = [makeRule()];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'preparation', []);
      expect(result[0].timestamp).toBeTruthy();
      expect(typeof result[0].timestamp).toBe('string');
    });
  });

  describe('フェーズフィルター', () => {
    it('phases=allはどのフェーズでもマッチする', () => {
      const rules = [makeRule({ phases: 'all' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'operation', []);
      expect(result).toHaveLength(1);
    });

    it('特定フェーズがマッチする', () => {
      const rules = [makeRule({ phases: 'operation' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'operation', []);
      expect(result).toHaveLength(1);
    });

    it('特定フェーズがマッチしない場合はスキップ', () => {
      const rules = [makeRule({ phases: 'operation' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'preparation', []);
      expect(result).toEqual([]);
    });

    it('セミコロン区切りのフェーズリスト', () => {
      const rules = [makeRule({ phases: 'preparation;operation' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'operation', []);
      expect(result).toHaveLength(1);
    });

    it('currentPhaseIdがundefinedの場合、all以外はスキップ', () => {
      const rules = [makeRule({ phases: 'operation' })];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, undefined, []);
      expect(result).toEqual([]);
    });
  });

  describe('複数ルール', () => {
    it('マッチするルールのみ返す', () => {
      const rules = [
        makeRule({ rule_id: 'r1', condition: 'OPENING:V1' }),
        makeRule({ rule_id: 'r2', condition: 'OPENING:V5' }),
      ];
      const result = checkRules(makeAction('open_valve', 1), makeState(), rules, 'preparation', []);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('r1');
    });
  });

  describe('デフォルトルールとの統合', () => {
    it('rule-001: V1閉でV2以降を開くとwarning', () => {
      const rules = parseCSV<Rule>(defaultRulesCSV);
      const state = makeState({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false });
      const result = checkRules(makeAction('open_valve', 2), state, rules, 'preparation', [1, 2, 3, 4, 5, 6, 7, 8]);
      const rule001 = result.find(v => v.id === 'rule-001');
      expect(rule001).toBeDefined();
      expect(rule001!.severity).toBe('warning');
    });

    it('rule-002: T1空でV6を開くとcritical', () => {
      const rules = parseCSV<Rule>(defaultRulesCSV);
      const state = makeState({}, { 'tank-T1': false });
      const result = checkRules(makeAction('open_valve', 6), state, rules, 'operation', [1, 2, 3, 4, 5, 6, 7, 8]);
      const rule002 = result.find(v => v.id === 'rule-002');
      expect(rule002).toBeDefined();
      expect(rule002!.severity).toBe('critical');
    });
  });
});
