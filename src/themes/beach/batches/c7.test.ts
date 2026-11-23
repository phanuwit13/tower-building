import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { BEACH_DOC } from './batch.test-helper';
import { items } from './c7';

/** Batch c7, in doc order. */
const ASSIGNED = ['ferry-dock', 'turtle-nursery', 'van-cafe', 'kite-stall', 'squid-grill', 'seahorse-statue', 'buoy', 'sea-pandanus'];

describe('beach batch c7', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(BEACH_DOC, 'c7')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, BEACH_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
