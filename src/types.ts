export interface PIDNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  type?: 'input' | 'outlet' | 'tank';
  tankId?: number;
}

export interface Valve {
  id: number;
  pipeId: string;
}

export interface Pipe {
  id: string;
  from: string;
  to: string;
  /** @deprecated Valve info is moving to Valve[]. Will be removed in Step 4-5. */
  valveId: number | null;
}

export type ValveState = Record<number, boolean>;
export type TankFilledState = Record<string, boolean>;
