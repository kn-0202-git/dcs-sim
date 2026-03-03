import { describe, it, expect } from 'vitest';
import { parseMxGraph } from '../mxGraphParser';

/** 最小限の mxGraph XML を生成するヘルパー */
const wrapMxGraph = (cells: string) => `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${cells}
  </root>
</mxGraphModel>`;

describe('parseMxGraph', () => {
  it('エッジから pipe を抽出する', () => {
    const xml = wrapMxGraph(`
      <mxCell id="input" vertex="1" value="供給" parent="1"/>
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="pipe-1" edge="1" source="input" target="tank-T1" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.pipes).toHaveLength(1);
    expect(result.pipes[0]).toEqual({
      id: 'pipe-1',
      from: 'input',
      to: 'tank-T1',
    });
  });

  it('valve を抽出し、接続する pipe を割り当てる', () => {
    const xml = wrapMxGraph(`
      <mxCell id="input" vertex="1" value="供給" parent="1"/>
      <mxCell id="valve-1" vertex="1" value="1" parent="1"/>
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="pipe-1" edge="1" source="input" target="valve-1" parent="1"/>
      <mxCell id="pipe-2" edge="1" source="valve-1" target="tank-T1" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.valves).toHaveLength(1);
    expect(result.valves[0].id).toBe('valve-1');
    // valve-1 は pipe-1 か pipe-2 のどちらかに割り当てられる
    expect(['pipe-1', 'pipe-2']).toContain(result.valves[0].pipeId);
  });

  it('tank を抽出し、ID末尾の数字を tankId にする', () => {
    const xml = wrapMxGraph(`
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="tank-T2" vertex="1" value="T-2" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.tanks).toHaveLength(2);
    expect(result.tanks[0]).toEqual({ id: 'tank-T1', tankId: '1' });
    expect(result.tanks[1]).toEqual({ id: 'tank-T2', tankId: '2' });
  });

  it('pipe-* 以外の edge は無視する', () => {
    const xml = wrapMxGraph(`
      <mxCell id="input" vertex="1" value="供給" parent="1"/>
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="pipe-1" edge="1" source="input" target="tank-T1" parent="1"/>
      <mxCell id="arrow-1" edge="1" source="input" target="tank-T1" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.pipes).toHaveLength(1);
    expect(result.pipes[0].id).toBe('pipe-1');
  });

  it('接続する pipe がない valve は pipeId=null になる', () => {
    const xml = wrapMxGraph(`
      <mxCell id="valve-1" vertex="1" value="1" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.valves).toHaveLength(1);
    expect(result.valves[0].pipeId).toBeNull();
  });

  it('完全なプラントトポロジーを正しく解析する', () => {
    const xml = wrapMxGraph(`
      <mxCell id="input" vertex="1" value="供給" parent="1"/>
      <mxCell id="connection-1" vertex="1" value="" parent="1"/>
      <mxCell id="valve-1" vertex="1" value="1" parent="1"/>
      <mxCell id="valve-2" vertex="1" value="2" parent="1"/>
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="outlet" vertex="1" value="出口" parent="1"/>
      <mxCell id="pipe-1" edge="1" source="input" target="valve-1" parent="1"/>
      <mxCell id="pipe-2" edge="1" source="valve-1" target="connection-1" parent="1"/>
      <mxCell id="pipe-3" edge="1" source="connection-1" target="valve-2" parent="1"/>
      <mxCell id="pipe-4" edge="1" source="valve-2" target="tank-T1" parent="1"/>
      <mxCell id="pipe-5" edge="1" source="tank-T1" target="outlet" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    // 5本のpipe
    expect(result.pipes).toHaveLength(5);

    // 2つのvalve、それぞれpipeが割り当てられている
    expect(result.valves).toHaveLength(2);
    expect(result.valves[0].pipeId).not.toBeNull();
    expect(result.valves[1].pipeId).not.toBeNull();

    // 1つのtank
    expect(result.tanks).toHaveLength(1);
    expect(result.tanks[0]).toEqual({ id: 'tank-T1', tankId: '1' });

    // pipe の接続が正しい
    const p1 = result.pipes.find(p => p.id === 'pipe-1');
    expect(p1).toEqual({ id: 'pipe-1', from: 'input', to: 'valve-1' });

    const p5 = result.pipes.find(p => p.id === 'pipe-5');
    expect(p5).toEqual({ id: 'pipe-5', from: 'tank-T1', to: 'outlet' });
  });

  it('三叉路（T字路）: connection に3本のpipeが接続するケース', () => {
    const xml = wrapMxGraph(`
      <mxCell id="input" vertex="1" value="供給" parent="1"/>
      <mxCell id="connection-1" vertex="1" value="" parent="1"/>
      <mxCell id="tank-T1" vertex="1" value="T-1" parent="1"/>
      <mxCell id="tank-T2" vertex="1" value="T-2" parent="1"/>
      <mxCell id="pipe-1" edge="1" source="input" target="connection-1" parent="1"/>
      <mxCell id="pipe-2" edge="1" source="connection-1" target="tank-T1" parent="1"/>
      <mxCell id="pipe-3" edge="1" source="connection-1" target="tank-T2" parent="1"/>
    `);

    const result = parseMxGraph(xml);

    expect(result.pipes).toHaveLength(3);

    const p1 = result.pipes.find(p => p.id === 'pipe-1')!;
    expect(p1.from).toBe('input');
    expect(p1.to).toBe('connection-1');

    const p2 = result.pipes.find(p => p.id === 'pipe-2')!;
    expect(p2.from).toBe('connection-1');
    expect(p2.to).toBe('tank-T1');

    const p3 = result.pipes.find(p => p.id === 'pipe-3')!;
    expect(p3.from).toBe('connection-1');
    expect(p3.to).toBe('tank-T2');
  });

  it('空の mxGraph XML（セルなし）', () => {
    const xml = wrapMxGraph('');

    const result = parseMxGraph(xml);

    expect(result.pipes).toHaveLength(0);
    expect(result.valves).toHaveLength(0);
    expect(result.tanks).toHaveLength(0);
  });
});
