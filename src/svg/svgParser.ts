import type { ParsedSVGData, SVGParseResult } from './types';

export function parseSvg(svgText: string): SVGParseResult {
  const errors: string[] = [];

  if (!svgText.trim()) {
    return { data: null, errors: ['SVGテキストが空です'] };
  }

  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    errors.push('SVGの解析に失敗しました');
  }

  const svg = doc.querySelector('svg');
  if (!svg) {
    errors.push('SVGタグが見つかりません');
  }

  if (errors.length > 0 || !svg) {
    return { data: null, errors };
  }

  const pipes = Array.from(svg.querySelectorAll('[data-from], [data-to]')).map(el => ({
    id: el.getAttribute('id'),
    from: el.getAttribute('data-from'),
    to: el.getAttribute('data-to'),
  }));

  const valves = Array.from(svg.querySelectorAll('[data-pipe]')).map(el => ({
    id: el.getAttribute('id'),
    pipeId: el.getAttribute('data-pipe'),
  }));

  const tanks = Array.from(svg.querySelectorAll('[data-tank-id]')).map(el => ({
    id: el.getAttribute('id'),
    tankId: el.getAttribute('data-tank-id'),
  }));

  const data: ParsedSVGData = { pipes, valves, tanks };
  return { data, errors };
}
