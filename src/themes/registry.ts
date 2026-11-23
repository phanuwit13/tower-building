import type { Catalog } from '../game/types';
import { amusement } from './amusement';
import { beach } from './beach';
import { market } from './market';
import { school } from './school';
import { zoo } from './zoo';
import { toCatalog, type ThemeDef } from './types';

export const THEMES: readonly ThemeDef[] = [school, amusement, zoo, beach, market];

export function getTheme(id: string): ThemeDef | undefined {
  return THEMES.find((t) => t.id === id);
}

const catalogs = new Map<string, Catalog>();

/** Built once per theme: the catalog is read on every drag/move. */
export function getCatalog(id: string): Catalog | undefined {
  const hit = catalogs.get(id);
  if (hit) return hit;
  const t = getTheme(id);
  if (!t) return undefined;
  const built = toCatalog(t);
  catalogs.set(id, built);
  return built;
}
