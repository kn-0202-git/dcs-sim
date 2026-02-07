import type { Rule, ValveAction, Violation, SimulatorState } from './types';
import { evaluateCondition } from './conditionEvaluator';

export function checkRules(
  action: ValveAction,
  state: SimulatorState,
  rules: Rule[],
  currentPhaseId: string | undefined,
  allValveIds: number[],
): Violation[] {
  const violations: Violation[] = [];

  for (const rule of rules) {
    // フェーズフィルター
    if (rule.phases !== 'all') {
      const allowedPhases = rule.phases.split(';');
      if (!currentPhaseId || !allowedPhases.includes(currentPhaseId)) continue;
    }

    if (evaluateCondition(rule.condition, state, action, allValveIds)) {
      violations.push({
        id: rule.rule_id,
        name: rule.rule_name,
        message: rule.error_message,
        severity: rule.severity,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }

  return violations;
}
