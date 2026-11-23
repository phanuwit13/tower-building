import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { CAFE_DOC } from './batches/batch.test-helper';
import { cafe } from './index';

describe('cafe theme', () => {
  it('is ร้านคาเฟ่ ☕ on wood, indoors, with a bright warm night', () => {
    expect(cafe).toMatchObject({ id: 'cafe', name: 'ร้านคาเฟ่', emoji: '☕', defaultGround: 'wood', nightGlow: 1.75, indoor: true });
  });
  it('the doc lists 60 items in seven batches, k1 to k7', () => {
    expect(CAFE_DOC.rows.size).toBe(60);
    expect(new Set([...CAFE_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = cafe.items.map((i) => i.id);
    expect(ids).toEqual([...CAFE_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(cafe, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
