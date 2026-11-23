import { describe, expect, it } from 'vitest';
import itemsMarkdown from '../../docs/game/items-school.md?raw';
import { DEFAULT_MIX } from './mix';
import { getStyleKit } from '../models/kit';
import { validateTheme } from '../models/validate';
import { THEMES, getCatalog, getTheme } from './registry';
import { clampNightGlow } from './types';

interface DocItem { id: string; name: string; footprint: string }
function docItems(): DocItem[] {
  const out: DocItem[] = [];
  for (const line of itemsMarkdown.split('\n')) {
    const c = line.split('|').map((x) => x.trim());
    if (c.length < 8 || !/^\d+$/.test(c[1])) continue;
    const fp = /^(\d)\s*[×x]\s*(\d)$/.exec(c[4]);
    if (fp) out.push({ id: c[2].replace(/`/g, ''), name: c[3], footprint: `${fp[1]}x${fp[2]}` });
  }
  return out;
}

describe('registry', () => {
  // Builds every item of every theme (six themes, ~350 items): past the default 5 s when every worker is busy.
  it('every theme passes validation', () => {
    const kit = getStyleKit();
    for (const t of THEMES) expect(validateTheme(t, kit, { minItems: 50 })).toEqual([]);
  }, 30_000);
  it('school has 50 valid items and the default footprint mix', () => {
    const school = getTheme('school')!;
    expect(validateTheme(school, getStyleKit(), { minItems: 50 })).toEqual([]);
    const counts: Record<string, number> = { '1x1': 0, '1x2': 0, '2x2': 0, '2x3': 0 };
    for (const it of school.items) {
      const [a, b] = [it.footprint.w, it.footprint.d].sort();
      counts[`${a}x${b}`] = (counts[`${a}x${b}`] ?? 0) + 1;
    }
    expect(counts).toEqual({ ...DEFAULT_MIX });
    expect(getCatalog('school')!.order.length).toBe(50);
    expect(school.name).toBe('โรงเรียน');
    expect(getTheme('nope')).toBeUndefined();
    expect(getCatalog('nope')).toBeUndefined();
  });
  it('school registry matches docs/game/items-school.md (ids, order, Thai names, footprints)', () => {
    const doc = docItems();
    expect(doc.length).toBe(50);
    const items = getTheme('school')!.items;
    expect(items.map((i) => i.id)).toEqual(doc.map((d) => d.id));
    items.forEach((it, i) => {
      expect(it.name, it.id).toBe(doc[i].name);
      expect(`${it.footprint.w}x${it.footprint.d}`, it.id).toBe(doc[i].footprint);
    });
  });
  it('getCatalog builds a theme catalog once', () => {
    const a = getCatalog('school');
    expect(getCatalog('school')).toBe(a);
  });
});

describe('nightGlow', () => {
  it('the shopping district and the café are registered with their bright nights; the other themes keep the standard one', () => {
    expect(THEMES.map((t) => t.id)).toEqual(['school', 'amusement', 'zoo', 'beach', 'market', 'cafe']);
    expect(getTheme('market')!.nightGlow).toBe(1.5);
    expect(getTheme('cafe')!.nightGlow).toBeGreaterThan(1);
    for (const t of THEMES.filter((x) => x.id !== 'market' && x.id !== 'cafe')) expect(clampNightGlow(t.nightGlow), t.id).toBe(1);
  });
  it('only the café is indoors', () => {
    expect(THEMES.filter((t) => t.indoor).map((t) => t.id)).toEqual(['cafe']);
  });
  it('clampNightGlow holds it to 1–2 and treats missing or broken as 1', () => {
    expect([undefined, NaN, Infinity, 0, -3, 1, 1.5, 2, 5].map(clampNightGlow)).toEqual([1, 1, 1, 1, 1, 1, 1.5, 2, 2]);
  });
  it('validateTheme rejects a nightGlow outside 1–2', () => {
    const kit = getStyleKit();
    const market = getTheme('market')!;
    expect(validateTheme({ ...market, nightGlow: 2 }, kit, { minItems: 50 })).toEqual([]);
    for (const bad of [0.5, 2.5, NaN]) {
      expect(validateTheme({ ...market, nightGlow: bad }, kit, { minItems: 50 }).join(), String(bad)).toMatch(/nightGlow .* outside 1–2/);
    }
  });
});
