import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { AMUSEMENT_DOC } from './batches/batch.test-helper';
import { amusement } from './index';

describe('amusement theme', () => {
  it('is สวนสนุก 🎡 on concrete', () => {
    expect(amusement).toMatchObject({ id: 'amusement', name: 'สวนสนุก', emoji: '🎡', defaultGround: 'concrete' });
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = amusement.items.map((i) => i.id);
    expect(ids).toEqual([...AMUSEMENT_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(amusement, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
