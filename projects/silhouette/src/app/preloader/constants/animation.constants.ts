/** Animation timing and configuration constants for the SILHOUETTE preloader. */

export const ANIMATION = {
  SAND_DURATION_MS: 800,
  PAUSE_DURATION_MS: 200,
  FLIP_DURATION_MS: 800,
  ENTRANCE_DURATION_MS: 500,
  EXIT_DURATION_MS: 500,

  GLOW_BREATH_DURATION_MS: 2000,
  GLOW_OPACITY_MIN: 0.08,
  GLOW_OPACITY_MAX: 0.15,

  GLITCH_MIN_INTERVAL_MS: 3000,
  GLITCH_MAX_INTERVAL_MS: 6000,
  GLITCH_DURATION_MIN_MS: 80,
  GLITCH_DURATION_MAX_MS: 150,

  DUST_SPAWN_INTERVAL_MS: 1000,
  DUST_SPAWN_COUNT_MIN: 3,
  DUST_SPAWN_COUNT_MAX: 6,

  SAND_GRAIN_SIZE_MIN: 2,
  SAND_GRAIN_SIZE_MAX: 3,
  SAND_GRAIN_COUNT: 280,

  EXIT_EXPLOSION_PARTICLE_COUNT: 320,
} as const;

export type HourglassPhase = 'sand' | 'pause' | 'flip';

export type PreloaderPhase = 'hidden' | 'entering' | 'active' | 'exiting' | 'complete';

export type ExitStage =
  | 'waiting'
  | 'final-flip'
  | 'glow-intensify'
  | 'sand-explosion'
  | 'logo-glitch'
  | 'fade-out';

export const HOURGLASS_VIEWBOX = {
  width: 11,
  height: 11,
} as const;

/** Pixel coordinates for the hourglass frame (outline only). */
export const HOURGLASS_FRAME_PIXELS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0],
  [7, 0],
  [8, 0],
  [9, 0],
  [1, 1],
  [9, 1],
  [2, 2],
  [8, 2],
  [3, 3],
  [7, 3],
  [4, 4],
  [6, 4],
  [5, 5],
  [4, 6],
  [6, 6],
  [3, 7],
  [7, 7],
  [2, 8],
  [8, 8],
  [1, 9],
  [9, 9],
  [1, 10],
  [2, 10],
  [3, 10],
  [4, 10],
  [5, 10],
  [6, 10],
  [7, 10],
  [8, 10],
  [9, 10],
];

/** Upper chamber sand fill pixels (inverted triangle). */
export const UPPER_SAND_PIXELS: ReadonlyArray<readonly [number, number]> = [
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [7, 1],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 2],
  [7, 2],
  [4, 3],
  [5, 3],
  [6, 3],
  [5, 4],
];

/** Bounding regions for sand chambers in viewBox units. */
export const CHAMBER_BOUNDS = {
  upper: { xMin: 2.5, xMax: 8.5, yMin: 0.5, yMax: 4.8, neckY: 5 },
  lower: { xMin: 2.5, xMax: 8.5, yMin: 5.2, yMax: 9.5, neckY: 5.2 },
  neck: { x: 5, y: 5, width: 1 },
} as const;
