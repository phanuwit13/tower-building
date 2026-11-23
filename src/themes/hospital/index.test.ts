import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../models/kit';
import { validateTheme } from '../../models/validate';
import { HOSPITAL_DOC } from './batches/batch.test-helper';
import { hospital } from './index';

describe('hospital theme', () => {
  it('is โรงพยาบาล 🏥 on a pale floor, indoors, with a bright night', () => {
    expect(hospital).toMatchObject({ id: 'hospital', name: 'โรงพยาบาล', emoji: '🏥', defaultGround: 'snow', nightGlow: 1.5, indoor: true });
  });
  it('the doc lists 60 items in seven batches', () => {
    expect(HOSPITAL_DOC.rows.size).toBe(60);
    expect(new Set([...HOSPITAL_DOC.rows.values()].map((r) => r.batch))).toEqual(new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7']));
  });
  it('lists the built items in doc order (the batches in turn)', () => {
    const ids = hospital.items.map((i) => i.id);
    expect(ids).toEqual([...HOSPITAL_DOC.rows.keys()].filter((id) => ids.includes(id)));
  });
  it('has unique ids and names and every item is valid', () => {
    expect(validateTheme(hospital, getStyleKit(), { minItems: 0 })).toEqual([]);
  });
});
