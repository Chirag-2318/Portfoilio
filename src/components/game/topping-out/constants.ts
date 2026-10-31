/**
 * Topping Out — Tunable Game Constants
 */

export const GAME_CONSTANTS = {
  // World Dimensions & Slabs
  SLAB_HEIGHT: 0.45,
  BASE_WIDTH: 3.2,
  BASE_DEPTH: 3.2,
  MAX_SLAB_SIZE: 3.2,
  METRES_PER_FLOOR: 3,

  // Motion & Speed
  OSCILLATION_RANGE: 3.6, // R = 3.6 units
  SPEED_INITIAL: 2.0, // for n = 1, 2, 3
  SPEED_BASE: 2.2,
  SPEED_ACCEL: 0.055,
  SPEED_MAX: 5.5,

  // Drop & Precision Thresholds
  MISS_THRESHOLD: 0.02, // overlap <= 0.02 is a miss
  PERFECT_THRESHOLD: 0.12, // abs(delta) <= 0.12 is perfect snap
  COMBO_REGROW_THRESHOLD: 4, // combo >= 4 triggers regrow
  REGROW_AMOUNT: 0.25,

  // Physics & Animation
  GRAVITY: 18.0, // units / s^2
  MISS_DURATION_MS: 600,
  DEBRIS_LIFETIME_MS: 900,
  PARTICLE_LIFETIME_MS: 500,
  PARTICLE_COUNT: 6,
  MAX_PARTICLES: 60,
  MAX_DEBRIS: 12,
  MAX_FLOATING_TEXTS: 6,

  // Squash Spring Animation
  SQUASH_INITIAL_SCALE: 0.88,
  SPRING_STIFFNESS: 280,
  SPRING_DAMPING: 16,

  // Camera
  CAMERA_SMOOTH_FACTOR: 6.0, // dt exponent
  CAMERA_VIEW_RATIO: 0.33,
  ORIGIN_Y_RATIO: 0.78,

  // Visual Effects & Feedback
  SCREEN_SHAKE_AMOUNT: 6, // px
  SCREEN_SHAKE_DURATION_MS: 250,
  PERFECT_EXPAND_DURATION_MS: 450,
  FLOATING_TEXT_DURATION_MS: 900,
  DIMENSION_ACCENT_DURATION_MS: 400,
  MILESTONE_NOTE_DURATION_MS: 1600,
  RESTART_DELAY_MS: 400,

  // Scale (pixels per world unit)
  SCALE_FACTOR: 0.11,
  SCALE_MIN: 34,
  SCALE_MAX: 52,

  // Storage Keys
  STORAGE_KEY_BEST: "topping-out-best",
  STORAGE_KEY_MUTED: "topping-out-muted",
} as const;
