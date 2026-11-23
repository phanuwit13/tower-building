import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { VILLAGE_DOC } from './batch.test-helper';
import { items } from './v4';

/** Batch v4, in doc order. */
const ASSIGNED = ['fish-pond', 'lotus-pond', 'waterside-pavilion', 'footbridge', 'rowboat', 'water-jars', 'hand-pump', 'firefly-bush', 'bamboo-clump'];

describe('village batch v4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(VILLAGE_DOC, 'v4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, VILLAGE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
