import type { SimulatorState, ValveAction } from './types';

export function evaluateCondition(
  conditionStr: string,
  state: SimulatorState,
  action: ValveAction | null = null,
  allValveIds: number[] = [],
  tankIdMap: Record<string, string> = {},
): boolean {
  if (!conditionStr) return true;

  // AND/OR で分割
  if (conditionStr.includes(' AND ')) {
    return conditionStr.split(' AND ').every(c =>
      evaluateCondition(c.trim(), state, action, allValveIds, tankIdMap)
    );
  }
  if (conditionStr.includes(' OR ')) {
    return conditionStr.split(' OR ').some(c =>
      evaluateCondition(c.trim(), state, action, allValveIds, tankIdMap)
    );
  }

  const cond = conditionStr.trim();
  const { valves, tanks } = state;

  // 特殊条件
  if (cond === 'ALL_VALVES_CLOSED') {
    return allValveIds.every(id => !valves[id]);
  }
  if (cond === 'ALL_VALVES_OPEN') {
    return allValveIds.every(id => valves[id]);
  }

  // アクション条件（ルール用）
  if (cond.startsWith('OPENING:')) {
    if (!action || action.type !== 'open_valve') return false;
    const target = cond.substring(8);
    if (target.endsWith('+')) {
      const minValve = parseInt(target.slice(1, -1));
      return action.target >= minValve;
    }
    const valveId = parseInt(target.substring(1));
    return action.target === valveId;
  }
  if (cond.startsWith('CLOSING:')) {
    if (!action || action.type !== 'close_valve') return false;
    const valveId = parseInt(cond.substring(9));
    return action.target === valveId;
  }

  // バルブ条件: V1=OPEN, V1=CLOSED
  const valveMatch = cond.match(/^V(\d+)=(OPEN|CLOSED)$/);
  if (valveMatch) {
    const valveId = parseInt(valveMatch[1]);
    const expected = valveMatch[2] === 'OPEN';
    return valves[valveId] === expected;
  }

  // タンク条件: T1=FILLED, T1=EMPTY
  const tankMatch = cond.match(/^T(\d+)=(FILLED|EMPTY)$/);
  if (tankMatch) {
    const shortName = `T${tankMatch[1]}`;
    // tankIdMap があればそれを使用、なければ従来の命名規則にフォールバック
    const tankId = tankIdMap[shortName] ?? `tank-T${tankMatch[1]}`;
    const expected = tankMatch[2] === 'FILLED';
    return tanks[tankId] === expected;
  }

  console.warn('Unknown condition:', cond);
  return false;
}
