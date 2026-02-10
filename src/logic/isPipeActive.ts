import type { Pipe, Valve, ValveState } from '../types';

export function isPipeActive(
  pipe: Pipe,
  valves: ValveState,
  reachableNodes: Set<string>,
  pipeToValveMap: ReadonlyMap<string, Valve>,
): boolean {
  const valve = pipeToValveMap.get(pipe.id);
  const canPass = !valve || valves[valve.id] === true;
  if (!canPass) return false;
  return reachableNodes.has(pipe.from) && reachableNodes.has(pipe.to);
}
