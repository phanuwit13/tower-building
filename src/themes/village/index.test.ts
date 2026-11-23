import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { VILLAGE_DOC } from './batches/batch.test-helper';
import { village } from './index';

describe('village theme', () => {
  it('is หมู่บ้าน 🏡 on grass, outdoors, with the standard night', () => {
    expect(village).toMatchObject({ id: 'village', name: 'หมู่บ้าน', emoji: '🏡', defaultGround: 'grass' });
    expect(village.indoor ?? false).toBe(false);
    expect(village.nightGlow ?? 1).toBe(1);
  });
  it('the doc lists 60 items in seven batches, v1 to v7', () => {
    expect(VILLAGE_DOC.rows.size).toBe(60);
    expect(new Set([...VILLAGE_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = village.items.map((i) => i.id);
    expect(ids).toEqual([...VILLAGE_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(village, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
