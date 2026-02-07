import type { Pipe, ValveState } from '../types';

export function isPipeActive(
  pipe: Pipe,
  valves: ValveState,
  reachableNodes: Set<string>,
): boolean {
  const canPass = pipe.valveId === null || valves[pipe.valveId] === true;
  if (!canPass) return false;
  return reachableNodes.has(pipe.from) && reachableNodes.has(pipe.to);
}
