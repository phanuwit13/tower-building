import type { Catalog } from '../game/types';
import { school } from './school';
import { toCatalog, type ThemeDef } from './types';

export const THEMES: readonly ThemeDef[] = [school];

export function getTheme(id: string): ThemeDef | undefined {
  return THEMES.find((t) => t.id === id);
}

export function getCatalog(id: string): Catalog | undefined {
  const t = getTheme(id);
  return t ? toCatalog(t) : undefined;
}
