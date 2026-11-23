import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { BEACH_DOC } from './batches/batch.test-helper';
import { beach } from './index';

describe('beach theme', () => {
  it('is ชายหาดทะเล 🏖️ on sand', () => {
    expect(beach).toMatchObject({ id: 'beach', name: 'ชายหาดทะเล', emoji: '🏖️', defaultGround: 'sand' });
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = beach.items.map((i) => i.id);
    expect(ids).toEqual([...BEACH_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(beach, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
