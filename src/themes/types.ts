import type { Catalog, GroundId, ItemSpec } from '../game/types';
import type { ItemModel } from '../models/contract';

export type ThemeId = 'school' | 'amusement' | 'cafe' | 'village' | 'hospital' | 'zoo' | 'beach' | 'space' | 'park' | 'market';
export interface ThemeDef {
  id: ThemeId; name: string; emoji: string; defaultGround: GroundId; items: readonly ItemModel[];
  /**
   * How brightly the theme's dusk and night are lit (src/render/environment.ts envPreset): 1, the
   * default, is the standard night; above 1 a city's night, with a brighter, warm-neutral street
   * light instead of moonlit blue (painted colours read as themselves) and, on smooth, stronger
   * glowing parts (the shopping district, 1.5). Day and dawn are never changed.
   */
  nightGlow?: number;
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
