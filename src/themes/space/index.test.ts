import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { SPACE_DOC } from './batches/batch.test-helper';
import { space } from './index';

describe('space theme', () => {
  it('is อวกาศ 🚀 on the moon ground, outdoors, with the standard night', () => {
    expect(space).toMatchObject({ id: 'space', name: 'อวกาศ', emoji: '🚀', defaultGround: 'moon' });
    expect(space.indoor ?? false).toBe(false);
    expect(space.nightGlow ?? 1).toBe(1);
  });
  it('the doc lists 60 items in seven batches', () => {
    expect(SPACE_DOC.rows.size).toBe(60);
    expect(new Set([...SPACE_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['s1', 's2', 's3', 's4', 's5', 's6', 's7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = space.items.map((i) => i.id);
    expect(ids).toEqual([...SPACE_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(space, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
