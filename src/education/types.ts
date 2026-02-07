export interface Phase {
  [key: string]: string;
  phase_id: string;
  phase_name: string;
  order: string;
}

export interface Step {
  [key: string]: string;
  phase_id: string;
  step_id: string;
  step_name: string;
  description: string;
  instruction: string;
  condition: string;
  order: string;
}

export interface Rule {
  [key: string]: string;
  rule_id: string;
  rule_name: string;
  condition: string;
  error_message: string;
  severity: string;
  phases: string;
}

export interface PhaseWithSteps {
  phase_id: string;
  phase_name: string;
  order: string;
  steps: Step[];
}

export interface ValveAction {
  type: 'open_valve' | 'close_valve';
  target: number;
}

export interface Violation {
  id: string;
  name: string;
  message: string;
  severity: string;
  timestamp: string;
}

export interface SimulatorState {
  valves: Record<number, boolean>;
  tanks: Record<string, boolean>;
}
