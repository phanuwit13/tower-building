import { describe, expect, it } from 'vitest';
import itemsMarkdown from '../../docs/game/items-school.md?raw';
import { DEFAULT_MIX } from './mix';
import { getStyleKit } from '../models/kit';
import { validateTheme } from '../models/validate';
import { THEMES, getCatalog, getTheme } from './registry';

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
  it('every theme passes validation', () => {
    const kit = getStyleKit();
    for (const t of THEMES) expect(validateTheme(t, kit, { minItems: 1 })).toEqual([]);
  });
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
