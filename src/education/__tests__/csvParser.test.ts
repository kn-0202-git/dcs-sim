import { describe, it, expect } from 'vitest';
import { parseCSV, defaultPhasesCSV, defaultStepsCSV, defaultRulesCSV } from '../csvParser';

describe('parseCSV', () => {
  describe('基本パース', () => {
    it('ヘッダーと行を正しくパースする', () => {
      const result = parseCSV('name,age\nAlice,30\nBob,25');
      expect(result).toEqual([
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' },
      ]);
    });

    it('空白をトリムする', () => {
      const result = parseCSV(' name , age \n Alice , 30 ');
      expect(result).toEqual([{ name: 'Alice', age: '30' }]);
    });

    it('値が足りない場合は空文字になる', () => {
      const result = parseCSV('a,b,c\n1,2');
      expect(result).toEqual([{ a: '1', b: '2', c: '' }]);
    });

    it('複数行を正しくパースする', () => {
      const result = parseCSV('x\n1\n2\n3');
      expect(result).toEqual([{ x: '1' }, { x: '2' }, { x: '3' }]);
    });

    it('単一カラムCSVをパースする', () => {
      const result = parseCSV('id\n1\n2');
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('空・異常系', () => {
    it('空文字列は空配列を返す', () => {
      expect(parseCSV('')).toEqual([]);
    });

    it('ヘッダーのみ（データ行なし）は空配列を返す', () => {
      expect(parseCSV('name,age')).toEqual([]);
    });
  });

  describe('デフォルトCSVデータ', () => {
    it('defaultPhasesCSVを正しくパースする（3フェーズ）', () => {
      const result = parseCSV(defaultPhasesCSV);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ phase_id: 'preparation', phase_name: '準備', order: '1' });
      expect(result[1]).toEqual({ phase_id: 'operation', phase_name: '運転', order: '2' });
      expect(result[2]).toEqual({ phase_id: 'shutdown', phase_name: '停止', order: '3' });
    });

    it('defaultStepsCSVを正しくパースする（8ステップ）', () => {
      const result = parseCSV(defaultStepsCSV);
      expect(result).toHaveLength(8);
      expect(result[0].phase_id).toBe('preparation');
      expect(result[0].step_id).toBe('prep-1');
    });

    it('defaultRulesCSVを正しくパースする（5ルール）', () => {
      const result = parseCSV(defaultRulesCSV);
      expect(result).toHaveLength(5);
      expect(result[0].rule_id).toBe('rule-001');
      expect(result[0].severity).toBe('warning');
    });
  });
});
