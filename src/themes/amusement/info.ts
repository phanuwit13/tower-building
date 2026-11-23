import type { ThemeDef } from '../types';

/**
 * The Amusement park theme without its items. The DEV batch gallery reads this rather than
 * index.ts, so reviewing one batch never loads (or reloads on) the other sculptors' batches.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'amusement', name: 'สวนสนุก', emoji: '🎡', defaultGround: 'concrete' };
