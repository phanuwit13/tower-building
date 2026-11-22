import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { validateBatch } from './batch.test-helper';
import { items } from './b5';

/** Batch 5: ice-cream-cart, noodle-stall, fruit-cart, tuk-tuk, umbrella-table, stone-table. */
const ASSIGNED = ['ice-cream-cart', 'noodle-stall', 'fruit-cart', 'tuk-tuk', 'umbrella-table', 'stone-table'];

describe('school batch 5', () => {
  it('every item is valid, unique, assigned to this batch and has the documented footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED)).toEqual([]);
  });

  // The integration step makes this strict (drop the guard); until then an empty batch passes.
  it('has every assigned id once the batch is started', () => {
    if (items.length === 0) return;
    expect(items.map((i) => i.id).sort()).toEqual([...ASSIGNED].sort());
  });
});
