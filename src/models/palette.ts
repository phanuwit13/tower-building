/**
 * Master palette shared by every theme (sRGB hex). Items pick colours from here and never invent
 * their own, so all 9 themes look like one game. Names describe the colour, not its use: a
 * `red` is a roof, a slide, a tomato or a flag stripe.
 *
 * Tuned for the scene's ACES tone mapping (exposure 1.4) under all four times of day: bright,
 * slightly warm and a little soft, so nothing goes neon at noon or muddy at dusk. Darker shades
 * are for trim and shaded parts of the same object, not for whole items.
 *
 * Any palette colour may be used for a glow part. `glow: true` keeps its colour by day and emits
 * it at dusk and night (`lampWarm`: a pale bulb). `glow: 'windowWarm'` on a `skyBlue` part gives
 * glass-blue windows by day that glow warm at night.
 */
export const PALETTE = {
  // neutrals
  white: '#f7f3ea',
  cream: '#f4e3c1',
  stone: '#bcc2cb',
  stoneDark: '#7f8898',
  chrome: '#94a8c2', // polished metal: taps, spouts, rails (bluer and lighter than stoneDark)
  charcoal: '#3e4456',
  // earth
  sand: '#e8c78e',
  wood: '#c4874f',
  woodDark: '#8a5935',
  bark: '#5a3a22', // shaded bark, chocolate, soil
  terracotta: '#c0603a', // clay pots, bricks, roof tiles
  // warm
  red: '#e5534b',
  redDark: '#b03a3c',
  orange: '#f4923a',
  sunYellow: '#ffc83d',
  brass: '#c9962c', // dark yellow metal: bells, trumpets, lamp fittings, a deep gold
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
  // glow colours: `lampWarm` with `glow: true`, `windowWarm` as the `glow` of a skyBlue part
  lampWarm: '#ffeaa6',
  windowWarm: '#ffd873',
} as const;

export type PaletteColor = keyof typeof PALETTE;
