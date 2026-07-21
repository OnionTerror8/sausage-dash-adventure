/** Global gameplay tuning. Toddler-friendly: forgiving, cheerful. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const GROUND_Y = 440;

export const PLAYER = {
  startX: 180,
  minX: 70, // never let a hit bounce the sausage off the left edge
  radius: 34,
  jumpVelocity: -720,
  gravity: 1800,
  bounceBack: 160,
  invulnMs: 1200,
  hitCoinLoss: 2,
};

export const SPEED = {
  start: 260,
  max: 520,
  rampPerSec: 4, // px/s added per second
};

export const SPAWN = {
  minGapMs: 1400, // never spawn hazards closer than this
  hazardChance: 0.55, // vs coin cluster
  coinTrailLen: [3, 7] as [number, number],
  coinRainEveryMs: 22000,
  graceMs: 4500, // every run/world opens hazard-free for this long, no matter what
};

export const POWERUPS = ["magnet", "superjump", "shield", "tiny", "balloon", "skates"] as const;
export type PowerupId = (typeof POWERUPS)[number];

export const POWERUP_DURATION_MS: Record<PowerupId, number> = {
  magnet: 8000,
  superjump: 8000,
  shield: 9000,
  tiny: 8000,
  balloon: 6000,
  skates: 7000,
};

export const POWERUP_COLOR: Record<PowerupId, number> = {
  magnet: 0xff5faf,
  superjump: 0x66d6ff,
  shield: 0xffd83a,
  tiny: 0x9fff9f,
  balloon: 0xff9f5f,
  skates: 0xc48aff,
};
