import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { BEACH_DOC } from './batch.test-helper';
import { items } from './c1';

/** Batch c1, in doc order. */
const ASSIGNED = ['pier', 'lighthouse', 'sandcastle', 'lifeguard-tower', 'sunloungers', 'umbrella-mat', 'longtail-boat', 'palm-tree', 'sand-bucket'];

describe('beach batch c1', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(BEACH_DOC, 'c1')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, BEACH_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
