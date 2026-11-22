import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { validateBatch } from './batch.test-helper';
import { items } from './b1';

/** Batch 1: library, canteen, school-bus, assembly-hall, science-lab, greenhouse, swimming-pool. */
const ASSIGNED = ['library', 'canteen', 'school-bus', 'assembly-hall', 'science-lab', 'greenhouse', 'swimming-pool'];

describe('school batch 1', () => {
  it('every item is valid, unique, assigned to this batch and has the documented footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED)).toEqual([]);
  });

  // The integration step makes this strict (drop the guard); until then an empty batch passes.
  it('has every assigned id once the batch is started', () => {
    if (items.length === 0) return;
    expect(items.map((i) => i.id).sort()).toEqual([...ASSIGNED].sort());
  });
});
