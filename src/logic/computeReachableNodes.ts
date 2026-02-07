import type { PIDNode, Pipe, ValveState, TankFilledState } from '../types';

export function computeReachableNodes(
  nodes: PIDNode[],
  pipes: Pipe[],
  valves: ValveState,
  tankFilled: TankFilledState,
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // 液源を起点に追加
  Object.entries(tankFilled).forEach(([id, filled]) => {
    if (filled) {
      reachable.add(id);
      queue.push(id);
    }
  });

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const pipe of pipes) {
      const canPass = pipe.valveId === null || valves[pipe.valveId] === true;
      if (!canPass) continue;

      let next: string | null = null;
      if (pipe.from === current) next = pipe.to;
      if (pipe.to === current) next = pipe.from;
      if (!next || reachable.has(next)) continue;

      // 空タンクからは先に進めない
      const currentNode = nodeMap.get(current);
      if (currentNode?.type === 'tank' && !tankFilled[current]) continue;

      reachable.add(next);
      queue.push(next);
    }
  }

  return reachable;
}
