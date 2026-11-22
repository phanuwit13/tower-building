import type { Catalog, GroundId, ItemSpec } from '../game/types';
import type { ItemModel } from '../models/contract';

export type ThemeId = 'school' | 'amusement' | 'cafe' | 'village' | 'hospital' | 'zoo' | 'beach' | 'space' | 'park';
export interface ThemeDef { id: ThemeId; name: string; emoji: string; defaultGround: GroundId; items: readonly ItemModel[] }

export function toCatalog(t: ThemeDef): Catalog {
  const items: Record<string, ItemSpec> = {};
  for (const it of t.items) items[it.id] = { id: it.id, footprint: it.footprint };
  return { themeId: t.id, order: t.items.map((i) => i.id), items };
}
