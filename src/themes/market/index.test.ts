import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { MARKET_DOC } from './batches/batch.test-helper';
import { market } from './index';

describe('market theme', () => {
  it('is ย่านการค้า 🛍️ on concrete, with a bright city night', () => {
    expect(market).toMatchObject({ id: 'market', name: 'ย่านการค้า', emoji: '🛍️', defaultGround: 'concrete', nightGlow: 1.5 });
  });
  it('the doc lists 70 items in eight batches, m1 to m8', () => {
    expect(MARKET_DOC.rows.size).toBe(70);
    expect(new Set([...MARKET_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = market.items.map((i) => i.id);
    expect(ids).toEqual([...MARKET_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(market, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
