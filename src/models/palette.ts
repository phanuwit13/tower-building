// Initial palette; finalised (~24 colours) in Task 14.
export const PALETTE = {
  wall: '#f2e4c9',
  roof: '#c8553d',
  grass: '#6bbf59',
  wood: '#a9743f',
  stone: '#9aa3ab',
  water: '#4fa3d9',
  sun: '#ffd23f',
  sky: '#8ecae6',
  pink: '#f4a6c0',
  white: '#fafafa',
} as const;

export type PaletteColor = keyof typeof PALETTE;
