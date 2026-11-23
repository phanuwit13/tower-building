import type { ThemeDef } from '../types';

/**
 * The Hospital theme without its items. The DEV batch gallery reads this rather than index.ts, so
 * reviewing one batch never loads (or reloads on) the other sculptors' batches.
 * An indoor theme like the café (owner, 2026-11-24: "inside the hospital, not outside"): the map is a hospital floor inside low walls with windows and open glass doors; a pale clean floor; a bright, calm night.
 * `room: 'hospital'`: the room's hospital look (src/render/room.ts): white walls, sliding glass doors standing open, a heart-and-plus sign.
 */
export const info: Omit<ThemeDef, 'items'> = { id: 'hospital', name: 'โรงพยาบาล', emoji: '🏥', defaultGround: 'snow', nightGlow: 1.5, indoor: true, room: 'hospital' };
