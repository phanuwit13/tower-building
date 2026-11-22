import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../models/kit';
import { validateTheme } from '../models/validate';
import { THEMES, getCatalog, getTheme } from './registry';

describe('registry', () => {
  it('every theme passes validation', () => {
    const kit = getStyleKit();
    for (const t of THEMES) expect(validateTheme(t, kit, { minItems: 1 })).toEqual([]);
  });
  it('school catalog has 12 items', () => {
    expect(getCatalog('school')!.order.length).toBe(12);
    expect(getTheme('school')!.name).toBe('โรงเรียน');
    expect(getTheme('nope')).toBeUndefined();
    expect(getCatalog('nope')).toBeUndefined();
  });
});
