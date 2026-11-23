import type { Catalog, GroundId, ItemSpec } from '../game/types';
import type { ItemModel } from '../models/contract';

export type ThemeId = 'school' | 'amusement' | 'cafe' | 'village' | 'hospital' | 'zoo' | 'beach' | 'space' | 'park' | 'market';
export interface ThemeDef {
  id: ThemeId; name: string; emoji: string; defaultGround: GroundId; items: readonly ItemModel[];
  /**
   * How brightly the theme's dusk and night are lit (src/render/environment.ts envPreset): 1, the
   * default, is the standard night; above 1 a city's night, with a warm, brighter street light and
   * stronger glowing parts (the shopping district, 1.5). Day and dawn are never changed.
   */
  nightGlow?: number;
}

export function toCatalog(t: ThemeDef): Catalog {
  const items: Record<string, ItemSpec> = {};
  for (const it of t.items) items[it.id] = { id: it.id, footprint: it.footprint };
  return { themeId: t.id, order: t.items.map((i) => i.id), items };
}
