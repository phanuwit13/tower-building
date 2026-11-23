import type { ThemeDef } from '../types';

/**
 * The Village theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * A Thai countryside village (owner's choice "ก", 2026-11-24) on grass, with the standard night.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'village', name: 'หมู่บ้าน', emoji: '🏡', defaultGround: 'grass' };
