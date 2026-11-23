import type { Catalog, GroundId, ItemSpec } from '../game/types';
import type { ItemModel } from '../models/contract';

export type ThemeId = 'school' | 'amusement' | 'cafe' | 'village' | 'hospital' | 'zoo' | 'beach' | 'space' | 'park' | 'market';
export interface ThemeDef {
  id: ThemeId; name: string; emoji: string; defaultGround: GroundId; items: readonly ItemModel[];
  /**
   * How brightly the theme's dusk and night are lit (src/render/environment.ts envPreset): 1, the
   * default, is the standard night; above 1 a city's night, with a brighter, warm-neutral street
   * light instead of moonlit blue (painted colours read as themselves), stronger glowing parts and,
   * on pretty, a bloom that lets saturated neon glow in colour (the shopping district, 1.5). Day
   * and dawn are never changed.
   */
  nightGlow?: number;
  /**
   * An indoor theme (the café, the hospital): the map is a room's floor. Low walls with windows and
   * a glass door stand round it, just outside the grid (src/render/room.ts); the land round it is a
   * pavement whatever the floor; rain falls only outside the walls and the floor never looks wet.
   */
  indoor?: boolean;
  /**
   * The look of an indoor theme's room (src/render/room.ts): the café's shop front (`cafe`, the
   * default) or the hospital's clean walls, sliding glass doors and heart-and-plus sign
   * (`hospital`). Ignored outdoors.
   */
  room?: RoomLook;
}

/** The looks of the room round an indoor theme's map. */
export type RoomLook = 'cafe' | 'hospital';
/** The room a theme shows: its own look indoors (the café's when it names none), none outdoors or with no theme. */
export function roomLookOf(t: Pick<ThemeDef, 'indoor' | 'room'> | undefined): RoomLook | null {
  return t?.indoor === true ? t.room ?? 'cafe' : null;
}

/** The range a theme's `nightGlow` may take: 1 is the standard night, 2 the brightest city night. */
export const NIGHT_GLOW_MIN = 1;
export const NIGHT_GLOW_MAX = 2;
/** A theme's night glow as the environment uses it: missing or not a number is 1, anything else is held to 1–2. */
export function clampNightGlow(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n)) return NIGHT_GLOW_MIN;
  return Math.min(NIGHT_GLOW_MAX, Math.max(NIGHT_GLOW_MIN, n));
}

export function toCatalog(t: ThemeDef): Catalog {
  const items: Record<string, ItemSpec> = {};
  for (const it of t.items) items[it.id] = { id: it.id, footprint: it.footprint };
  return { themeId: t.id, order: t.items.map((i) => i.id), items };
}
