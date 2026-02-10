import type { Pipe, Valve } from '../types';

export interface ParsedSVGPipe {
  id: string | null;
  from: string | null;
  to: string | null;
}

export interface ParsedSVGValve {
  id: string | null;
  pipeId: string | null;
}

export interface ParsedSVGTank {
  id: string | null;
  tankId: string | null;
}

export interface ParsedSVGData {
  pipes: ParsedSVGPipe[];
  valves: ParsedSVGValve[];
  tanks: ParsedSVGTank[];
}

export interface SVGParseResult {
  data: ParsedSVGData | null;
  errors: string[];
}

export interface SVGTankNode {
  id: string;
  tankId: number;
}

export interface SVGValidatedData {
  pipes: Pipe[];
  valves: Valve[];
  tanks: SVGTankNode[];
  nodeIds: string[];
}

export interface SVGValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: SVGValidatedData;
}
