import type { PIDNode, Pipe, Valve } from '../types';
import type { DerivedHelpers } from '../data/deriveHelpers';
import { deriveHelpers } from '../data/deriveHelpers';
import { extractMxGraphXml } from './mxGraphExtractor';
import { parseMxGraph } from './mxGraphParser';
import { parseSvg } from './svgParser';
import { validateSvgData } from './svgValidator';
import type { ParsedSVGData, SVGValidatedData } from './types';

export interface SVGTopology {
  nodes: PIDNode[];
  pipes: Pipe[];
  valves: Valve[];
  helpers: DerivedHelpers;
}

export interface SVGTopologyBuildResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  topology?: SVGTopology;
}

const inferNodeType = (nodeId: string, tankIds: Set<string>): PIDNode['type'] | undefined => {
  if (tankIds.has(nodeId)) return 'tank';
  if (nodeId === 'input' || nodeId.startsWith('input-')) return 'input';
  if (nodeId === 'outlet' || nodeId.startsWith('outlet-')) return 'outlet';
  return undefined;
};

const buildNodes = (data: SVGValidatedData, warnings: string[]): PIDNode[] => {
  const tankMap = new Map(data.tanks.map(t => [t.id, t.tankId]));
  const tankIdSet = new Set(tankMap.keys());
  let inputCount = 0;
  let outletCount = 0;

  const nodes = data.nodeIds.map(id => {
    const type = inferNodeType(id, tankIdSet);
    if (type === 'input') inputCount += 1;
    if (type === 'outlet') outletCount += 1;
    return {
      id,
      x: 0,
      y: 0,
      type,
      tankId: type === 'tank' ? tankMap.get(id) : undefined,
    };
  });

  if (inputCount === 0) warnings.push('inputノードが見つかりません');
  if (outletCount === 0) warnings.push('outletノードが見つかりません');

  return nodes;
};

const buildTopology = (data: SVGValidatedData, initialWarnings: string[]): SVGTopologyBuildResult => {
  const warnings = [...initialWarnings];
  const nodes = buildNodes(data, warnings);
  const helpers = deriveHelpers(nodes, data.valves);

  return {
    valid: true,
    errors: [],
    warnings,
    topology: {
      nodes,
      pipes: data.pipes,
      valves: data.valves,
      helpers,
    },
  };
};

const mergeErrors = (mxErrors: string[], attrErrors: string[]): string[] => {
  return [
    ...mxErrors.map(err => `[mxGraph] ${err}`),
    ...attrErrors.map(err => `[data-*] ${err}`),
  ];
};

export async function buildSvgTopology(svgText: string): Promise<SVGTopologyBuildResult> {
  const parsedAttr = parseSvg(svgText);
  if (parsedAttr.errors.length > 0 || !parsedAttr.data) {
    return { valid: false, errors: parsedAttr.errors, warnings: [] };
  }

  const attrValidation = validateSvgData(parsedAttr.data);

  let mxXml: string | null = null;
  try {
    mxXml = await extractMxGraphXml(svgText);
  } catch {
    if (!attrValidation.valid || !attrValidation.data) {
      return {
        valid: false,
        errors: ['mxGraphの抽出中にエラーが発生しました', ...attrValidation.errors],
        warnings: [...attrValidation.warnings],
      };
    }
    return buildTopology(attrValidation.data, [
      ...attrValidation.warnings,
      'mxGraphの抽出に失敗したため、data-*属性の解析結果を使用しました',
    ]);
  }

  if (mxXml) {
    const parsedMx: ParsedSVGData = parseMxGraph(mxXml);
    const mxValidation = validateSvgData(parsedMx);
    if (mxValidation.valid && mxValidation.data) {
      return buildTopology(mxValidation.data, mxValidation.warnings);
    }
    if (attrValidation.valid && attrValidation.data) {
      return buildTopology(attrValidation.data, [
        ...attrValidation.warnings,
        'mxGraphの解析結果が不正のため、data-*属性の解析結果を使用しました',
      ]);
    }
    return {
      valid: false,
      errors: mergeErrors(mxValidation.errors, attrValidation.errors),
      warnings: [...mxValidation.warnings, ...attrValidation.warnings],
    };
  }

  const validation = attrValidation;
  if (!validation.valid || !validation.data) {
    return { valid: false, errors: validation.errors, warnings: validation.warnings };
  }
  return buildTopology(validation.data, validation.warnings);
}
