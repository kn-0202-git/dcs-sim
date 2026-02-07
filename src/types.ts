export interface PIDNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  type?: 'source' | 'inlet' | 'outlet' | 'tank' | 'junction';
}

export interface Pipe {
  id: string;
  from: string;
  to: string;
  valveId: number | null;
}

export type ValveState = Record<number, boolean>;
export type TankFilledState = Record<string, boolean>;
