import { describe, it, expect } from 'vitest';
import { parseSvg } from '../svgParser';

const validSvg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path id="pipe-1" data-from="input" data-to="n1" d="M0 0" />
  <path id="pipe-2" data-from="n1" data-to="tank-T1" d="M1 1" />
  <circle id="valve-1" data-pipe="pipe-2" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
`;

describe('parseSvg', () => {
  it('data属性から pipes/valves/tanks を抽出する', () => {
    const result = parseSvg(validSvg);
    expect(result.errors).toEqual([]);
    expect(result.data?.pipes).toHaveLength(2);
    expect(result.data?.valves).toHaveLength(1);
    expect(result.data?.tanks).toHaveLength(1);
    expect(result.data?.pipes[0]).toEqual({ id: 'pipe-1', from: 'input', to: 'n1' });
  });

  it('空文字はエラーとして扱う', () => {
    const result = parseSvg('   ');
    expect(result.data).toBeNull();
    expect(result.errors).toContain('SVGテキストが空です');
  });

  it('svgタグがない場合はエラーになる', () => {
    const result = parseSvg('<div></div>');
    expect(result.data).toBeNull();
    expect(result.errors).toContain('SVGタグが見つかりません');
  });

  it('不正なXMLは解析エラーになる', () => {
    const result = parseSvg('<svg><path></svg');
    expect(result.data).toBeNull();
    expect(result.errors).toContain('SVGの解析に失敗しました');
  });

  it('data-from のみでも pipes に含まれる', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path id="pipe-3" data-from="a" d="M0 0" />
      </svg>
    `;
    const result = parseSvg(svg);
    expect(result.data?.pipes).toEqual([{ id: 'pipe-3', from: 'a', to: null }]);
  });

  it('関連属性がない要素は無視される', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle id="just-shape" r="5" />
      </svg>
    `;
    const result = parseSvg(svg);
    expect(result.data?.pipes).toEqual([]);
    expect(result.data?.valves).toEqual([]);
    expect(result.data?.tanks).toEqual([]);
  });
});
