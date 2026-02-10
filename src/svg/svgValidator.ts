import type { Pipe, Valve } from '../types';
import type { ParsedSVGData, SVGValidatedData, SVGValidationResult, SVGTankNode } from './types';

function parseTrailingNumber(value: string): number | null {
  const match = value.match(/(\d+)$/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isInteger(num) ? num : null;
}

export function validateSvgData(parsed: ParsedSVGData): SVGValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const pipes: Pipe[] = [];
  const pipeIds = new Set<string>();
  const pipeNodeIds = new Set<string>();

  parsed.pipes.forEach((pipe, index) => {
    if (!pipe.id) {
      errors.push(`パイプ要素(${index})にidがありません`);
      return;
    }
    if (pipeIds.has(pipe.id)) {
      errors.push(`パイプID重複: "${pipe.id}"`);
      return;
    }
    pipeIds.add(pipe.id);

    if (!pipe.from) {
      errors.push(`パイプ "${pipe.id}": data-from がありません`);
    }
    if (!pipe.to) {
      errors.push(`パイプ "${pipe.id}": data-to がありません`);
    }
    if (pipe.from && pipe.to) {
      pipes.push({ id: pipe.id, from: pipe.from, to: pipe.to });
      pipeNodeIds.add(pipe.from);
      pipeNodeIds.add(pipe.to);
    }
  });

  if (parsed.pipes.length === 0) {
    errors.push('data-from/data-to を持つ配管が見つかりません');
  }

  const valves: Valve[] = [];
  const valveIds = new Set<number>();
  const pipeIdsWithValve = new Set<string>();

  parsed.valves.forEach((valve, index) => {
    if (!valve.id) {
      errors.push(`バルブ要素(${index})にidがありません`);
      return;
    }
    const valveId = parseTrailingNumber(valve.id);
    if (valveId == null) {
      errors.push(`バルブ "${valve.id}" のIDから番号を取得できません`);
      return;
    }
    if (valveIds.has(valveId)) {
      errors.push(`バルブID重複: ${valveId}`);
      return;
    }
    valveIds.add(valveId);

    if (!valve.pipeId) {
      errors.push(`バルブ "${valve.id}": data-pipe がありません`);
      return;
    }
    if (!pipeIds.has(valve.pipeId)) {
      errors.push(`バルブ ${valveId}: pipeId "${valve.pipeId}" は存在しないパイプ`);
      return;
    }
    if (pipeIdsWithValve.has(valve.pipeId)) {
      errors.push(`パイプ "${valve.pipeId}" に複数のバルブが割り当てられています`);
      return;
    }
    pipeIdsWithValve.add(valve.pipeId);

    valves.push({ id: valveId, pipeId: valve.pipeId });
  });

  const tanks: SVGTankNode[] = [];
  const tankIds = new Set<number>();
  const tankElementIds = new Set<string>();

  parsed.tanks.forEach((tank, index) => {
    if (!tank.id) {
      errors.push(`タンク要素(${index})にidがありません`);
      return;
    }
    if (tankElementIds.has(tank.id)) {
      errors.push(`タンクID重複: "${tank.id}"`);
      return;
    }
    tankElementIds.add(tank.id);

    if (!tank.tankId) {
      errors.push(`タンク "${tank.id}": data-tank-id がありません`);
      return;
    }
    const tankIdValue = Number(tank.tankId);
    if (!Number.isInteger(tankIdValue) || tankIdValue <= 0) {
      errors.push(`タンク "${tank.id}": data-tank-id "${tank.tankId}" は不正な番号`);
      return;
    }
    if (tankIds.has(tankIdValue)) {
      errors.push(`タンク番号重複: ${tankIdValue}`);
      return;
    }
    tankIds.add(tankIdValue);

    tanks.push({ id: tank.id, tankId: tankIdValue });
  });

  for (const tank of tanks) {
    if (!pipeNodeIds.has(tank.id)) {
      warnings.push(`タンク "${tank.id}" が配管で参照されていません`);
    }
  }

  const nodeIds = Array.from(new Set([...pipeNodeIds, ...tanks.map(t => t.id)])).sort();

  const valid = errors.length === 0;
  const data: SVGValidatedData | undefined = valid ? { pipes, valves, tanks, nodeIds } : undefined;

  return { valid, errors, warnings, data };
}
