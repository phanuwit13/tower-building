import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { SPACE_DOC } from './batch.test-helper';
import { items } from './s4';

/** Batch s4, in doc order. */
const ASSIGNED = ['rover-garage', 'cargo-lander', 'moon-rover', 'moon-buggy', 'hover-sled', 'drone-pad', 'cargo-robot', 'rover-charger', 'robot-dog'];

describe('space batch s4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(SPACE_DOC, 's4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, SPACE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
