import type { ThemeDef } from '../types';

/**
 * The Beach theme without its items. The DEV batch gallery reads this rather than
 * index.ts, so reviewing one batch never loads (or reloads on) the other sculptors' batches.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'beach', name: 'ชายหาดทะเล', emoji: '🏖️', defaultGround: 'sand' };
