import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { ZOO_DOC } from './batch.test-helper';
import { items } from './z1';

/** Batch z1, in doc order. */
const ASSIGNED = ['penguin-pool', 'giraffe-yard', 'lion-rock', 'zebra-paddock', 'zoo-tram', 'feed-kiosk', 'shaded-bench', 'shade-tree', 'acacia-tree'];

describe('zoo batch z1', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(ZOO_DOC, 'z1')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, ZOO_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
