import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { validateBatch } from './batch.test-helper';
import { items } from './b2';

/** Batch 2: football-pitch, basketball-court, pavilion, merry-go-round, jungle-gym, sandpit, bus-stop, garden-shed, water-tower. */
const ASSIGNED = ['football-pitch', 'basketball-court', 'pavilion', 'merry-go-round', 'jungle-gym', 'sandpit', 'bus-stop', 'garden-shed', 'water-tower'];

describe('school batch 2', () => {
  it('every item is valid, unique, assigned to this batch and has the documented footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED)).toEqual([]);
  });

  it('has every assigned id', () => {
    expect(items.map((i) => i.id).sort()).toEqual([...ASSIGNED].sort());
  });
});
