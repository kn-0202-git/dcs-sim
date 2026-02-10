import type { PIDNode, Pipe, Valve } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTopology(nodes: PIDNode[], pipes: Pipe[], valves: Valve[]): ValidationResult {
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
  for (const valve of valves) {
    if (seenValveIds.has(valve.id)) {
      errors.push(`バルブID重複: ${valve.id}`);
    }
    seenValveIds.add(valve.id);
  }

  // バルブのpipeIdが実在パイプを参照しているか
  const pipeIds = new Set(pipes.map(p => p.id));
  for (const valve of valves) {
    if (!pipeIds.has(valve.pipeId)) {
      errors.push(`バルブ ${valve.id}: pipeId "${valve.pipeId}" は存在しないパイプ`);
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
