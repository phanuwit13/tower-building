import type { ThemeDef } from '../types';

/**
 * The Zoo theme without its items. The DEV batch gallery reads this rather than
 * index.ts, so reviewing one batch never loads (or reloads on) the other sculptors' batches.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'zoo', name: 'สวนสัตว์', emoji: '🦁', defaultGround: 'grass' };
