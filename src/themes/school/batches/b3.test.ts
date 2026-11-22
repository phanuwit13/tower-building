import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { validateBatch } from './batch.test-helper';
import { items } from './b3';

/** Batch 3: flower-planter, banana-tree, coconut-palm, vegetable-garden, flower-garden, fish-pond, school-cat, chicken-coop. */
const ASSIGNED = ['flower-planter', 'banana-tree', 'coconut-palm', 'vegetable-garden', 'flower-garden', 'fish-pond', 'school-cat', 'chicken-coop'];

describe('school batch 3', () => {
  it('every item is valid, unique, assigned to this batch and has the documented footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED)).toEqual([]);
  });

  // The integration step makes this strict (drop the guard); until then an empty batch passes.
  it('has every assigned id once the batch is started', () => {
    if (items.length === 0) return;
    expect(items.map((i) => i.id).sort()).toEqual([...ASSIGNED].sort());
  });
});
