import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { ZOO_DOC } from './batches/batch.test-helper';
import { zoo } from './index';

describe('zoo theme', () => {
  it('is สวนสัตว์ 🦁 on grass', () => {
    expect(zoo).toMatchObject({ id: 'zoo', name: 'สวนสัตว์', emoji: '🦁', defaultGround: 'grass' });
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = zoo.items.map((i) => i.id);
    expect(ids).toEqual([...ZOO_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(zoo, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
