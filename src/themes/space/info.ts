import type { ThemeDef } from '../types';

/**
 * The Space theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * A friendly moon base on the moon ground; no wind on the moon (no sway or wave); the standard night, lit by domes, beacons and crystals.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'space', name: 'อวกาศ', emoji: '🚀', defaultGround: 'moon' };
