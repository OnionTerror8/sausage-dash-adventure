/**
 * World themes: colours + parallax band definitions.
 * Adding a world = adding an entry here.
 */

export interface WorldTheme {
  id: string;
  name: string;
  sky: [number, number]; // top, bottom hex
  ground: number;
  groundAccent: number;
  hill: number;
  cloud: number;
  accent: number;
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
  },
];

export function getWorld(id?: string): WorldTheme {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}
