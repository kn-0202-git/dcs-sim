import type { PIDNode, Pipe, Valve } from '../types';
import type { DerivedHelpers } from '../data/deriveHelpers';
import { deriveHelpers } from '../data/deriveHelpers';
import { parseSvg } from './svgParser';
import { validateSvgData } from './svgValidator';
import type { SVGValidatedData } from './types';

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

export function buildSvgTopology(svgText: string): SVGTopologyBuildResult {
  const parsed = parseSvg(svgText);
  if (parsed.errors.length > 0 || !parsed.data) {
    return { valid: false, errors: parsed.errors, warnings: [] };
  }

  const validation = validateSvgData(parsed.data);
  if (!validation.valid || !validation.data) {
    return { valid: false, errors: validation.errors, warnings: validation.warnings };
  }

  const warnings = [...validation.warnings];
  const nodes = buildNodes(validation.data, warnings);
  const helpers = deriveHelpers(nodes, validation.data.valves);

  return {
    valid: true,
    errors: [],
    warnings,
    topology: {
      nodes,
      pipes: validation.data.pipes,
      valves: validation.data.valves,
      helpers,
    },
  };
}
