import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { PARK_DOC } from './batches/batch.test-helper';
import { park } from './index';

describe('park theme', () => {
  it('is สวนสาธารณะ 🌳 on grass, outdoors, with the standard night', () => {
    expect(park).toMatchObject({ id: 'park', name: 'สวนสาธารณะ', emoji: '🌳', defaultGround: 'grass' });
    expect(park.indoor ?? false).toBe(false);
    expect(park.nightGlow ?? 1).toBe(1);
  });
  it('the doc lists 60 items in seven batches', () => {
    expect(PARK_DOC.rows.size).toBe(60);
    expect(new Set([...PARK_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = park.items.map((i) => i.id);
    expect(ids).toEqual([...PARK_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(park, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
