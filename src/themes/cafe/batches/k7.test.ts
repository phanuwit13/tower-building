import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { CAFE_DOC } from './batch.test-helper';
import { items } from './k7';

/** Batch k7, in doc order. */
const ASSIGNED = ['long-table', 'cat-tower', 'restrooms', 'plant-ladder', 'planter-box', 'cactus-trio', 'cat-basket', 'dog-bed'];

describe('cafe batch k7', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(CAFE_DOC, 'k7')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, CAFE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
