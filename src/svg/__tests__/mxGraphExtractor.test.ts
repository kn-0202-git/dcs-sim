import { describe, it, expect } from 'vitest';
import { extractMxGraphXml } from '../mxGraphExtractor';

describe('extractMxGraphXml', () => {
  it('content 属性に非圧縮 mxGraph XML が含まれる場合、そのまま返す', async () => {
    const mxXml = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>';
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(mxXml)}"></svg>`;

    const result = await extractMxGraphXml(svgText);

    expect(result).toBe(mxXml);
  });

  it('content 属性がない SVG は null を返す', async () => {
    const svgText = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';

    const result = await extractMxGraphXml(svgText);

    expect(result).toBeNull();
  });

  it('SVG タグがない場合は null を返す', async () => {
    const result = await extractMxGraphXml('<div>not svg</div>');

    expect(result).toBeNull();
  });

  it('content 属性の値が mxGraph XML でない場合は null を返す', async () => {
    const svgText = '<svg xmlns="http://www.w3.org/2000/svg" content="hello"></svg>';

    const result = await extractMxGraphXml(svgText);

    expect(result).toBeNull();
  });

  it('mxfile を含む非圧縮 content も認識する', async () => {
    const mxXml = '<mxfile><diagram><mxGraphModel><root><mxCell id="0"/></root></mxGraphModel></diagram></mxfile>';
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" content="${encodeURIComponent(mxXml)}"></svg>`;

    const result = await extractMxGraphXml(svgText);

    expect(result).toBe(mxXml);
  });
});
