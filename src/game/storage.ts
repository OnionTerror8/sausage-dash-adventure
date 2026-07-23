/**
 * Persistent storage helpers backed by LocalStorage.
 * All game progress (coins, unlocks, settings) lives here.
 */

const KEY = "sausage-dash-save-v1";

export interface SaveData {
  totalCoins: number;
  bestScore: number;
  unlocked: string[]; // cosmetic ids
  completedWorlds: string[]; // world ids finished at least once (Journey Mode)
  seenWorldIntros: string[]; // world ids whose first-time intro card has been shown
  recipeCards: string[]; // world ids where every special treat was collected in one run
  equipped: {
    hat?: string;
    face?: string;
    trail?: string;
    theme?: string; // world id
    bank?: string; // coin-counter cosmetic id
  };
  settings: {
    sound: boolean;
    music: boolean;
    chillMode: boolean; // hazard-free play, for the youngest/first-time players
  };
}

const DEFAULT: SaveData = {
  totalCoins: 0,
  bestScore: 0,
  unlocked: ["hat_none", "face_smile", "trail_none", "theme_kitchen", "bank_jar"],
  completedWorlds: [],
  seenWorldIntros: [],
  recipeCards: [],
  equipped: {
    hat: "hat_none",
    face: "face_smile",
    trail: "trail_none",
    theme: "theme_kitchen",
    bank: "bank_jar",
  },
  settings: { sound: true, music: true, chillMode: false },
};

export function loadSave(): SaveData {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT,
      ...parsed,
      equipped: { ...DEFAULT.equipped, ...(parsed.equipped ?? {}) },
      settings: { ...DEFAULT.settings, ...(parsed.settings ?? {}) },
      unlocked: Array.from(new Set([...DEFAULT.unlocked, ...(parsed.unlocked ?? [])])),
      completedWorlds: Array.from(
        new Set([...DEFAULT.completedWorlds, ...(parsed.completedWorlds ?? [])]),
      ),
      seenWorldIntros: Array.from(
        new Set([...DEFAULT.seenWorldIntros, ...(parsed.seenWorldIntros ?? [])]),
      ),
      recipeCards: Array.from(new Set([...DEFAULT.recipeCards, ...(parsed.recipeCards ?? [])])),
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveSave(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

/** Mutate + autosave. */
export function updateSave(fn: (d: SaveData) => void): SaveData {
  const d = loadSave();
  fn(d);
  saveSave(d);
  return d;
}
