import type { ThemeDef } from '../types';

/**
 * The Park theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * A big city park on grass, with the standard night.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'park', name: 'สวนสาธารณะ', emoji: '🌳', defaultGround: 'grass' };
