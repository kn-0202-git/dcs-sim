import type { PIDNode, Valve, ValveState, TankFilledState } from '../types';

export interface DerivedHelpers {
  valveMap: ReadonlyMap<number, Valve>;
  pipeToValveMap: ReadonlyMap<string, Valve>;
  allValveIds: number[];
  allTankIds: string[];
  nodeMap: Record<string, PIDNode>;
  tankIdMap: Record<string, string>;
  initialValves: ValveState;
  initialTankFilled: TankFilledState;
}

export function deriveHelpers(nodes: PIDNode[], valves: Valve[]): DerivedHelpers {
  const valveMap: ReadonlyMap<number, Valve> = new Map(valves.map(v => [v.id, v]));
  const pipeToValveMap: ReadonlyMap<string, Valve> = new Map(valves.map(v => [v.pipeId, v]));
  const allValveIds: number[] = valves.map(v => v.id).sort((a, b) => a - b);
  const allTankIds: string[] = nodes.filter(n => n.type === 'tank').map(n => n.id);
  const nodeMap: Record<string, PIDNode> = Object.fromEntries(nodes.map(n => [n.id, n]));
  const tankIdMap: Record<string, string> = Object.fromEntries(
    nodes
      .filter(n => n.type === 'tank' && n.tankId != null)
      .map(n => [`T${n.tankId}`, n.id])
  );
  const initialValves: ValveState = Object.fromEntries(allValveIds.map(id => [id, false]));
  const initialTankFilled: TankFilledState = Object.fromEntries(
    nodes
      .filter(n => n.type === 'input' || n.type === 'tank')
      .map(n => [n.id, n.type === 'input'])
  );

  return {
    valveMap,
    pipeToValveMap,
    allValveIds,
    allTankIds,
    nodeMap,
    tankIdMap,
    initialValves,
    initialTankFilled,
  };
}
