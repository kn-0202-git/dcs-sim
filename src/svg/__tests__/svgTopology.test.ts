import { describe, it, expect } from 'vitest';
import { buildSvgTopology } from '../svgTopology';

const validDataSvg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <path id="pipe-1" data-from="input" data-to="tank-T1" d="M0 0" />
  <path id="pipe-2" data-from="tank-T1" data-to="outlet" d="M1 1" />
  <circle id="valve-1" data-pipe="pipe-1" r="5" />
  <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
</svg>
`;

const mxGraphXml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="input" vertex="1" parent="1"/>
    <mxCell id="valve-1" vertex="1" parent="1"/>
    <mxCell id="tank-T1" vertex="1" parent="1"/>
    <mxCell id="outlet" vertex="1" parent="1"/>
    <mxCell id="pipe-1" edge="1" source="input" target="valve-1" parent="1"/>
    <mxCell id="pipe-2" edge="1" source="valve-1" target="tank-T1" parent="1"/>
    <mxCell id="pipe-3" edge="1" source="tank-T1" target="outlet" parent="1"/>
  </root>
</mxGraphModel>
`.trim();

describe('buildSvgTopology', () => {
  it('有効なdata属性SVGからトポロジーを作成できる', async () => {
    const result = await buildSvgTopology(validDataSvg);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.topology?.nodes.map(n => n.id)).toEqual(['input', 'outlet', 'tank-T1']);
    expect(result.topology?.helpers.initialTankFilled['input']).toBe(true);
    expect(result.topology?.helpers.initialTankFilled['tank-T1']).toBe(false);
    expect(result.topology?.helpers.allValveIds).toEqual([1]);
  });

  it('draw.io SVG（mxGraph埋め込み）からトポロジーを作成できる', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(mxGraphXml)}"></svg>`;
    const result = await buildSvgTopology(svg);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.topology?.pipes).toHaveLength(3);
    expect(result.topology?.nodes.map(n => n.id).sort()).toEqual(['input', 'outlet', 'tank-T1', 'valve-1']);
    expect(result.topology?.helpers.allValveIds).toEqual([1]);
  });

  it('mxGraphが不正でもdata属性が有効ならフォールバックできる', async () => {
    const invalidMx = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(invalidMx)}">
        <path id="pipe-1" data-from="input" data-to="tank-T1" d="M0 0" />
        <path id="pipe-2" data-from="tank-T1" data-to="outlet" d="M1 1" />
        <circle id="valve-1" data-pipe="pipe-1" r="5" />
        <rect id="tank-T1" data-tank-id="1" width="10" height="10" />
      </svg>
    `;
    const result = await buildSvgTopology(svg);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('mxGraphの解析結果が不正のため、data-*属性の解析結果を使用しました');
  });

  it('input/outlet がない場合は警告を出す', async () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path id="pipe-1" data-from="a" data-to="b" d="M0 0" />
      </svg>
    `;
    const result = await buildSvgTopology(svg);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('inputノードが見つかりません');
    expect(result.warnings).toContain('outletノードが見つかりません');
  });

  it('mxGraph/data属性の両方が不正なら統合エラーになる', async () => {
    const invalidMx = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(invalidMx)}"></svg>`;
    const result = await buildSvgTopology(svg);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.startsWith('[mxGraph]'))).toBe(true);
    expect(result.errors.some(e => e.startsWith('[data-*]'))).toBe(true);
  });

  it('不正なSVGはエラーになる', async () => {
    const result = await buildSvgTopology('<svg><path></svg');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
