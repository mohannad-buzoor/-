import { SimulationMode, SimulationState } from './types';

export const DEFAULT_STATE: SimulationState = {
  mode: SimulationMode.SUSPENDED,
  mass: 10,
  angle: 0,
  tensionMagnitude: 100,
  g: 10,
};

export const COLORS = {
  bg: '#F0F4FA',
  object: '#FFD966',
  surface: '#8B8B8B',
  fg: '#3366FF', // Blue for Weight
  ft: '#FF3333', // Red for Tension
  fn: '#33AA33', // Green for Normal Force
  components: 'rgba(255, 51, 51, 0.6)',
  text: '#1A1A1A',
};

export const SCALES = {
  forceToPixels: 2, // 1N = 2px
  objectSize: 60,
};
