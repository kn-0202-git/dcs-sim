import type { PIDNode, Pipe } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTopology(nodes: PIDNode[], pipes: Pipe[]): ValidationResult {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map(n => n.id));

  // ノードID重複チェック
  const seenNodeIds = new Set<string>();
  for (const node of nodes) {
    if (seenNodeIds.has(node.id)) {
      errors.push(`ノードID重複: "${node.id}"`);
    }
    seenNodeIds.add(node.id);
  }

  // パイプID重複チェック
  const seenPipeIds = new Set<string>();
  for (const pipe of pipes) {
    if (seenPipeIds.has(pipe.id)) {
      errors.push(`パイプID重複: "${pipe.id}"`);
    }
    seenPipeIds.add(pipe.id);
  }

  // パイプの from/to が実在ノードを参照しているか
  for (const pipe of pipes) {
    if (!nodeIds.has(pipe.from)) {
      errors.push(`パイプ "${pipe.id}": from "${pipe.from}" は存在しないノード`);
    }
    if (!nodeIds.has(pipe.to)) {
      errors.push(`パイプ "${pipe.id}": to "${pipe.to}" は存在しないノード`);
    }
  }

  // バルブID重複チェック
  const seenValveIds = new Set<number>();
  for (const pipe of pipes) {
    if (pipe.valveId !== null) {
      if (seenValveIds.has(pipe.valveId)) {
        errors.push(`バルブID重複: ${pipe.valveId}`);
      }
      seenValveIds.add(pipe.valveId);
    }
  }

  // タンクID重複チェック
  const seenTankIds = new Set<number>();
  for (const node of nodes) {
    if (node.tankId != null) {
      if (seenTankIds.has(node.tankId)) {
        errors.push(`タンクID重複: ${node.tankId}`);
      }
      seenTankIds.add(node.tankId);
    }
  }

  return { valid: errors.length === 0, errors };
}
