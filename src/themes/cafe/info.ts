import type { ThemeDef } from '../types';

/**
 * The Café theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * `indoor`: the map is the café's floor, inside low walls with windows and a glass door; rain falls
 * only outside, on the pavement round it (owner's choice "ก", 2026-11-24).
 * `nightGlow`: a bright, warm night, like a lit café in the evening; brighter than the shopping
 * district's 1.5 (inside reads warmly lit), short of 2, where the pretty tier's dusk bloom washes out.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'cafe', name: 'ร้านคาเฟ่', emoji: '☕', defaultGround: 'wood', nightGlow: 1.75, indoor: true };
