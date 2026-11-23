import type { ThemeDef } from '../types';

/**
 * The Shopping district theme without its items. The DEV batch gallery reads this rather than
 * index.ts, so reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * `nightGlow`: a bright, colourful city night (the owner: "lots of colourful light at night, not dark").
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'market', name: 'ย่านการค้า', emoji: '🛍️', defaultGround: 'concrete', nightGlow: 1.5 };
