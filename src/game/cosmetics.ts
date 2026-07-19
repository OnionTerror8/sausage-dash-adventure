/**
 * Cosmetic catalogue. Purely visual — never affects gameplay.
 * Add an entry here to add a new shop item.
 */

export type CosmeticKind = "hat" | "face" | "trail" | "theme";

export interface Cosmetic {
  id: string;
  kind: CosmeticKind;
  name: string;
  price: number; // 0 = starter/free
  color?: number;
  color2?: number;
}

export const COSMETICS: Cosmetic[] = [
  // Hats
  { id: "hat_none", kind: "hat", name: "No Hat", price: 0 },
  { id: "hat_chef", kind: "hat", name: "Chef Hat", price: 50, color: 0xffffff },
  { id: "hat_pirate", kind: "hat", name: "Pirate Hat", price: 80, color: 0x2a2a2a, color2: 0xffffff },
  { id: "hat_cowboy", kind: "hat", name: "Cowboy Hat", price: 90, color: 0xb0763a },
  { id: "hat_crown", kind: "hat", name: "Crown", price: 150, color: 0xffd83a },
  { id: "hat_birthday", kind: "hat", name: "Birthday Hat", price: 60, color: 0xff5faf, color2: 0x5fd0ff },
  { id: "hat_viking", kind: "hat", name: "Viking Helmet", price: 120, color: 0xa0a0a8, color2: 0xf0e0a0 },
  { id: "hat_dino", kind: "hat", name: "Dinosaur Hat", price: 130, color: 0x5fd07a },
  { id: "hat_beanie", kind: "hat", name: "Beanie", price: 40, color: 0x5faaff },

  // Faces
  { id: "face_smile", kind: "face", name: "Smile", price: 0 },
  { id: "face_grin", kind: "face", name: "Big Grin", price: 25 },
  { id: "face_wink", kind: "face", name: "Wink", price: 35 },
  { id: "face_tongue", kind: "face", name: "Silly Tongue", price: 45 },
  { id: "face_shades", kind: "face", name: "Cool Shades", price: 70 },

  // Trails
  { id: "trail_none", kind: "trail", name: "No Trail", price: 0 },
  { id: "trail_sparkle", kind: "trail", name: "Sparkles", price: 60, color: 0xfff59a },
  { id: "trail_rainbow", kind: "trail", name: "Rainbow Trail", price: 200 },
  { id: "trail_hearts", kind: "trail", name: "Hearts", price: 90, color: 0xff6f9f },
  { id: "trail_bubbles", kind: "trail", name: "Bubbles", price: 70, color: 0x9fd6ff },

  // Themes (worlds) — kitchen is free
  { id: "theme_kitchen", kind: "theme", name: "Sunny Kitchen", price: 0 },
  { id: "theme_picnic", kind: "theme", name: "Picnic Park", price: 100 },
  { id: "theme_camping", kind: "theme", name: "Camping Adventure", price: 150 },
  { id: "theme_birthday", kind: "theme", name: "Birthday Party", price: 200 },
  { id: "theme_rainbow", kind: "theme", name: "Rainbow Meadow", price: 250 },
  { id: "theme_candy", kind: "theme", name: "Candy Kitchen", price: 300 },
];

export const byKind = (k: CosmeticKind) => COSMETICS.filter((c) => c.kind === k);
export const byId = (id: string) => COSMETICS.find((c) => c.id === id);
