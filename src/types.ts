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
}

export type ValveState = Record<number, boolean>;
export type TankFilledState = Record<string, boolean>;
