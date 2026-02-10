import { describe, it, expect } from 'vitest';
import { buildSvgTopology } from '../svgTopology';

const validSvg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path id="pipe-1" data-from="input" data-to="tank-T1" d="M0 0" />
  <path id="pipe-2" data-from="tank-T1" data-to="outlet" d="M1 1" />
  <circle id="valve-1" data-pipe="pipe-1" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
`;

describe('buildSvgTopology', () => {
  it('有効なSVGからトポロジーを作成できる', () => {
    const result = buildSvgTopology(validSvg);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.topology?.nodes.map(n => n.id)).toEqual(['input', 'outlet', 'tank-T1']);
    expect(result.topology?.helpers.initialTankFilled['input']).toBe(true);
    expect(result.topology?.helpers.initialTankFilled['tank-T1']).toBe(false);
    expect(result.topology?.helpers.allValveIds).toEqual([1]);
  });

  it('input/outlet がない場合は警告を出す', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path id="pipe-1" data-from="a" data-to="b" d="M0 0" />
      </svg>
    `;
    const result = buildSvgTopology(svg);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('inputノードが見つかりません');
    expect(result.warnings).toContain('outletノードが見つかりません');
  });

  it('不正なSVGはエラーになる', () => {
    const result = buildSvgTopology('<svg><path></svg');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
