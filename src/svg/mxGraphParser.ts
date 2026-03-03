/**
 * mxGraph XML を解析して ParsedSVGData を生成する。
 *
 * draw.io の mxGraph XML 構造:
 *   <mxCell id="pipe-1" edge="1" source="input" target="connection-1" />
 *   <mxCell id="valve-1" vertex="1" value="1" style="ellipse;..." />
 *   <mxCell id="tank-T1" vertex="1" value="T-1" style="rounded=1;..." />
 */

import type { ParsedSVGData, ParsedSVGPipe, ParsedSVGValve, ParsedSVGTank } from './types';

/** ID から末尾の数字を抽出する（例: "valve-1" → "1", "tank-T2" → "2"） */
const parseTrailingNumber = (id: string): string | null => {
  const match = id.match(/(\d+)$/);
  return match ? match[1] : null;
};

interface MxCell {
  id: string;
  isEdge: boolean;
  isVertex: boolean;
  source: string | null;
  target: string | null;
  value: string | null;
  style: string | null;
  parent: string | null;
}

function parseMxCells(mxXml: string): MxCell[] {
  const doc = new DOMParser().parseFromString(mxXml, 'text/xml');
  const cells = Array.from(doc.querySelectorAll('mxCell'));

  return cells.map(cell => ({
    id: cell.getAttribute('id') ?? '',
    isEdge: cell.getAttribute('edge') === '1',
    isVertex: cell.getAttribute('vertex') === '1',
    source: cell.getAttribute('source'),
    target: cell.getAttribute('target'),
    value: cell.getAttribute('value'),
    style: cell.getAttribute('style'),
    parent: cell.getAttribute('parent'),
  }));
}

/** mxGraph XML を ParsedSVGData に変換 */
export function parseMxGraph(mxXml: string): ParsedSVGData {
  const cells = parseMxCells(mxXml);

  // エッジ（線）→ pipe 候補
  // pipe-* パターンの ID を持つエッジを配管として抽出
  const edges = cells.filter(c => c.isEdge && c.source && c.target);
  const pipeEdges = edges.filter(c => c.id.startsWith('pipe-') || c.id.startsWith('pipe_'));

  const pipes: ParsedSVGPipe[] = pipeEdges.map(edge => ({
    id: edge.id,
    from: edge.source,
    to: edge.target,
  }));

  // 頂点（図形）→ valve / tank の分類
  const vertices = cells.filter(c => c.isVertex && c.id);

  // valve: ID が valve-* パターン
  const valveCells = vertices.filter(c => c.id.startsWith('valve-') || c.id.startsWith('valve_'));

  // valve-to-pipe 割り当て: valve の ID を source/target に持つ pipe を探す
  const valves: ParsedSVGValve[] = valveCells.map(valve => {
    const connectedPipe = pipes.find(
      p => p.from === valve.id || p.to === valve.id,
    );
    return {
      id: valve.id,
      pipeId: connectedPipe?.id ?? null,
    };
  });

  // tank: ID が tank-* パターン
  const tankCells = vertices.filter(c => c.id.startsWith('tank-') || c.id.startsWith('tank_'));

  const tanks: ParsedSVGTank[] = tankCells.map(tank => ({
    id: tank.id,
    tankId: parseTrailingNumber(tank.id),
  }));

  return { pipes, valves, tanks };
}
