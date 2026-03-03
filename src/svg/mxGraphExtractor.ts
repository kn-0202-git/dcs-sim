/**
 * draw.io SVG から埋め込み mxGraph XML を検出・展開する。
 *
 * draw.io は SVG エクスポート時に「ダイアグラムのコピーを含める」が ON の場合、
 * <svg> 要素の content 属性に圧縮エンコードされた mxGraph XML を埋め込む。
 *
 * エンコード形式:
 *   encodeURIComponent → deflate-raw → btoa → encodeURIComponent
 *
 * デコード（本モジュール）:
 *   decodeURIComponent → atob → inflate-raw → decodeURIComponent → XML
 */

/** inflate-raw で展開する（ブラウザネイティブ DecompressionStream を使用） */
async function inflateRaw(compressed: Uint8Array): Promise<string> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

/** draw.io の content 属性値をデコードして mxGraph XML を返す */
async function decodeMxGraphContent(encoded: string): Promise<string> {
  // Step 1: URL デコード
  const base64 = decodeURIComponent(encoded);

  // 圧縮されていない場合（XML がそのまま入っている）
  if (base64.startsWith('<mxfile') || base64.startsWith('<mxGraphModel')) {
    return base64;
  }

  // Step 2: Base64 デコード → バイナリ
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

  // Step 3: inflate-raw
  const inflated = await inflateRaw(bytes);

  // Step 4: URL デコード（draw.io は XML を encodeURIComponent してから圧縮する）
  return decodeURIComponent(inflated);
}

/**
 * SVG テキストから埋め込み mxGraph XML を抽出する。
 * draw.io SVG でない場合は null を返す。
 */
export async function extractMxGraphXml(svgText: string): Promise<string | null> {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;

  // draw.io は <svg> の content 属性に埋め込む
  const content = svg.getAttribute('content');
  if (!content) return null;

  try {
    const xml = await decodeMxGraphContent(content);
    // mxGraph XML であることを最低限チェック
    if (xml.includes('mxGraphModel') || xml.includes('mxCell')) {
      return xml;
    }
    return null;
  } catch {
    return null;
  }
}
