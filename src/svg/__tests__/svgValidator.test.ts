import { describe, it, expect } from 'vitest';
import type { ParsedSVGData } from '../types';
import { parseSvg } from '../svgParser';
import { validateSvgData } from '../svgValidator';

const validSvg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path id="pipe-1" data-from="input" data-to="n1" d="M0 0" />
  <path id="pipe-2" data-from="n1" data-to="tank-T1" d="M1 1" />
  <circle id="valve-1" data-pipe="pipe-2" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
`;

describe('validateSvgData', () => {
  it('正常なSVGデータを検証できる', () => {
    const parsed = parseSvg(validSvg).data!;
    const result = validateSvgData(parsed);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data?.pipes).toEqual([
      { id: 'pipe-1', from: 'input', to: 'n1' },
      { id: 'pipe-2', from: 'n1', to: 'tank-T1' },
    ]);
    expect(result.data?.valves).toEqual([{ id: 1, pipeId: 'pipe-2' }]);
    expect(result.data?.tanks).toEqual([{ id: 'tank-T1', tankId: 1 }]);
    expect(result.data?.nodeIds).toEqual(['input', 'n1', 'tank-T1']);
  });

  it('パイプ要素にidがない場合はエラー', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: null, from: 'a', to: 'b' }],
      valves: [],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('パイプ要素(0)にidがありません');
  });

  it('パイプIDの重複を検出する', () => {
    const parsed: ParsedSVGData = {
      pipes: [
        { id: 'pipe-1', from: 'a', to: 'b' },
        { id: 'pipe-1', from: 'b', to: 'c' },
      ],
      valves: [],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('パイプID重複: "pipe-1"');
  });

  it('data-from/data-to の欠落を検出する', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: null }],
      valves: [],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('パイプ "pipe-1": data-to がありません');
  });

  it('バルブのidが取得できない場合はエラー', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: 'b' }],
      valves: [{ id: 'valve-x', pipeId: 'pipe-1' }],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('バルブ "valve-x" のIDから番号を取得できません');
  });

  it('存在しないパイプを参照するバルブを検出する', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: 'b' }],
      valves: [{ id: 'valve-1', pipeId: 'pipe-99' }],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('バルブ 1: pipeId "pipe-99" は存在しないパイプ');
  });

  it('同じパイプに複数バルブがある場合はエラー', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: 'b' }],
      valves: [
        { id: 'valve-1', pipeId: 'pipe-1' },
        { id: 'valve-2', pipeId: 'pipe-1' },
      ],
      tanks: [],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('パイプ "pipe-1" に複数のバルブが割り当てられています');
  });

  it('タンク要素のid欠落を検出する', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: 'b' }],
      valves: [],
      tanks: [{ id: null, tankId: '1' }],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('タンク要素(0)にidがありません');
  });

  it('タンク番号が不正な場合はエラー', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'a', to: 'tank-T1' }],
      valves: [],
      tanks: [{ id: 'tank-T1', tankId: 'zero' }],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('タンク "tank-T1": data-tank-id "zero" は不正な番号');
  });

  it('タンク番号の重複を検出する', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'tank-A', to: 'tank-B' }],
      valves: [],
      tanks: [
        { id: 'tank-A', tankId: '1' },
        { id: 'tank-B', tankId: '1' },
      ],
    };
    const result = validateSvgData(parsed);
    expect(result.errors).toContain('タンク番号重複: 1');
  });

  it('配管から参照されていないタンクは警告', () => {
    const parsed: ParsedSVGData = {
      pipes: [{ id: 'pipe-1', from: 'input', to: 'n1' }],
      valves: [],
      tanks: [{ id: 'tank-T1', tankId: '1' }],
    };
    const result = validateSvgData(parsed);
    expect(result.warnings).toContain('タンク "tank-T1" が配管で参照されていません');
  });
});
