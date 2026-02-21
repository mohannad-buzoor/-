export enum SimulationMode {
  SUSPENDED = 'SUSPENDED',
  PULLED = 'PULLED'
}

export interface SimulationState {
  mode: SimulationMode;
  mass: number; // kg
  angle: number; // degrees
  tensionMagnitude: number; // N
  g: number; // m/s^2
}

export interface ForceData {
  fg: number;
  ft: number;
  fn: number;
  ftx: number;
  fty: number;
  isFloating: boolean;
}
