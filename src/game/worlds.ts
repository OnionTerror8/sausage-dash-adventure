/**
 * World themes: colours + parallax band definitions.
 * Adding a world = adding an entry here.
 */
import type { BgMotifKind } from "./bgshapes";

export interface WorldTheme {
  id: string;
  name: string;
  sky: [number, number]; // top, bottom hex
  ground: number;
  groundAccent: number;
  hill: number;
  cloud: number;
  accent: number;
  /** Score needed to reach this world's finish-line landmark and end the run. */
  finishScore: number;
  /** Friendly destination name shown on the world-complete celebration. */
  landmark: string;
  /** Distant background silhouette motif, for a bit more per-world identity. */
  bgMotif: BgMotifKind;
}

export const WORLDS: WorldTheme[] = [
  {
    id: "theme_kitchen",
    name: "Sunny Kitchen",
    sky: [0xfff6d0, 0xffd88a],
    ground: 0xffb060,
    groundAccent: 0xffd18a,
    hill: 0xffcf7a,
    cloud: 0xfff8e8,
    accent: 0xff7a59,
    finishScore: 700,
    landmark: "the Cookie Jar",
    bgMotif: "cupcake",
  },
  {
    id: "theme_picnic",
    name: "Picnic Park",
    sky: [0xbfe8ff, 0x86d3ff],
    ground: 0x7fce5a,
    groundAccent: 0xa8e082,
    hill: 0x5ab84a,
    cloud: 0xffffff,
    accent: 0xff5f7a,
    finishScore: 850,
    landmark: "the Picnic Basket",
    bgMotif: "tree",
  },
  {
    id: "theme_camping",
    name: "Camping Adventure",
    sky: [0xc4dcf5, 0x89b6e3],
    ground: 0x8a6a3b,
    groundAccent: 0xa88750,
    hill: 0x4f7a3a,
    cloud: 0xf0f4ff,
    accent: 0xff8a3d,
    finishScore: 1000,
    landmark: "the Campfire S'mores",
    bgMotif: "tent",
  },
  {
    id: "theme_birthday",
    name: "Birthday Party",
    sky: [0xffd8f0, 0xffb0da],
    ground: 0xffb0d5,
    groundAccent: 0xffd0e8,
    hill: 0xf78dc0,
    cloud: 0xffffff,
    accent: 0x8a5cff,
    finishScore: 1150,
    landmark: "the Birthday Cake",
    bgMotif: "balloon",
  },
  {
    id: "theme_rainbow",
    name: "Rainbow Meadow",
    sky: [0xd0f0ff, 0xffe0f0],
    ground: 0x9fe27a,
    groundAccent: 0xc3f0a3,
    hill: 0x7cc860,
    cloud: 0xffffff,
    accent: 0xff5fa0,
    finishScore: 1300,
    landmark: "the Pot of Gold",
    bgMotif: "rainbow",
  },
  {
    id: "theme_candy",
    name: "Candy Kitchen",
    sky: [0xffe0f0, 0xffc0e0],
    ground: 0xff9ec6,
    groundAccent: 0xffc8dd,
    hill: 0xff70a8,
    cloud: 0xfff0ff,
    accent: 0x7ad0ff,
    finishScore: 1500,
    landmark: "the Candy Castle",
    bgMotif: "candycane",
  },
];

export function getWorld(id?: string): WorldTheme {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}
