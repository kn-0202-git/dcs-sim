export interface PIDNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  type?: 'input' | 'outlet' | 'tank';
  tankId?: number;
}

export interface Pipe {
  id: string;
  from: string;
  to: string;
  valveId: number | null;
}

export type ValveState = Record<number, boolean>;
export type TankFilledState = Record<string, boolean>;
