import type { ThemeDef } from '../types';

/**
 * The Tokyo theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * Japan's capital (owner, 2026-11-24): many tall buildings, Tokyo Tower, a Japanese temple, trains, food stalls, cherry blossoms; concrete ground; a bright, colourful neon night.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'tokyo', name: 'เมืองโตเกียว', emoji: '🗼', defaultGround: 'concrete', nightGlow: 1.5 };
