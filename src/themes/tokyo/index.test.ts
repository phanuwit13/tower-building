import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { TOKYO_DOC } from './batches/batch.test-helper';
import { tokyo } from './index';

describe('tokyo theme', () => {
  it('is เมืองโตเกียว 🗼 on concrete, outdoors, with a bright neon night', () => {
    expect(tokyo).toMatchObject({ id: 'tokyo', name: 'เมืองโตเกียว', emoji: '🗼', defaultGround: 'concrete', nightGlow: 1.5 });
    expect(tokyo.indoor ?? false).toBe(false);
  });
  it('the doc lists 60 items in seven batches', () => {
    expect(TOKYO_DOC.rows.size).toBe(60);
    expect(new Set([...TOKYO_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['t1', 't2', 't3', 't4', 't5', 't6', 't7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = tokyo.items.map((i) => i.id);
    expect(ids).toEqual([...TOKYO_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(tokyo, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
