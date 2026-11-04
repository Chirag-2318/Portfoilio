// Configuration constants for the Intro Gate and cinematic entrance transition.
// All timings, easings, physics, and dimensions are centralized here.

export const INTRO_CONFIG = {
  // Timings (in milliseconds)
  minDisplayMs: 1800,           // Minimum display time for progress readout (prevents flashing)
  failsafeTimeoutMs: 8000,      // Maximum wait before forcing gate to interactive ready state
  pressFeedbackMs: 90,          // Duration of button press scale feedback
  fadeExitMs: 300,              // Duration for label/arrow and monogram exit fade
  revealStartDelayMs: 150,      // Delay before expanding the aperture mask
  revealDurationMs: 950,        // Duration of clip-path expansion and portfolio focus pull
  totalTransitionMs: 1100,      // Total transition time before gate is unmounted from DOM
  handoffEmitMs: 700,           // Timestamp to emit "intro:entering" hand-off event
  reducedMotionDurationMs: 300, // Instant 300ms crossfade duration when reduced-motion is requested

  // Transform & Optics Physics
  monogramExitScale: 1.04,      // Monogram subtle lift scale on exit
  portfolioEnterScaleStart: 1.06, // Portfolio zoom scale pulling in
  portfolioEnterBlurStartPx: 12,  // Portfolio depth-of-field blur pulling in
  buttonPressScale: 0.97,       // Enter button compression scale
  magneticPullMaxPx: 8,         // Maximum cursor magnetic pull distance (px)

  // Timing Curves
  easeExpoOut: "cubic-bezier(0.16, 1, 0.3, 1)", // Apple-keynote style deceleration curve
  easeStandard: "cubic-bezier(0.23, 1, 0.32, 1)", // Standard UI easing

  // Query parameter to bypass gate during development
  skipParam: "skipintro",
} as const;

