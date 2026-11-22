/**
 * Master palette shared by every theme (sRGB hex). Items pick colours from here and never invent
 * their own, so all 9 themes look like one game. Names describe the colour, not its use: a
 * `red` is a roof, a slide, a tomato or a flag stripe.
 *
 * Tuned for the scene's ACES tone mapping (exposure 1.4) under all four times of day: bright,
 * slightly warm and a little soft, so nothing goes neon at noon or muddy at dusk. Darker shades
 * are for trim and shaded parts of the same object, not for whole items.
 *
 * Any palette colour may be used for a glow part (`glow: true`): it keeps its colour by day and
 * lights up at dusk and night. `lampWarm` and `windowWarm` are made for it: they read as pale
 * bulbs and sunny panes by day.
 */
export const PALETTE = {
  // neutrals
  white: '#f7f3ea',
  cream: '#f4e3c1',
  stone: '#bcc2cb',
  stoneDark: '#7f8898',
  charcoal: '#3e4456',
  // earth
  sand: '#e8c78e',
  wood: '#c4874f',
  woodDark: '#8a5935',
  bark: '#5a3a22', // shaded bark, chocolate, soil
  // warm
  red: '#e5534b',
  redDark: '#b03a3c',
  orange: '#f4923a',
  sunYellow: '#ffc83d',
  pink: '#f59ac2',
  purple: '#9b78d8',
  // greens (leaf is darker and bluer than the grass ground so plants stand out on it)
  leaf: '#4aa84e',
  leafDark: '#2e8549',
  lime: '#a8d93c', // lawns, young leaves, fruit, aliens
  mint: '#94dcc1',
  // blues
  teal: '#2aa6a2',
  skyBlue: '#7dc4f0',
  blue: '#3f7fdb',
  navy: '#2f4a86',
  glassBlue: '#c2e8f7',
  // glow: use with `glow: true`
  lampWarm: '#ffeaa6',
  windowWarm: '#ffd873',
} as const;

export type PaletteColor = keyof typeof PALETTE;
