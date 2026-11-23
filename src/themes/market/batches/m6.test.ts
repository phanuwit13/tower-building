import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { MARKET_DOC } from './batch.test-helper';
import { items } from './m6';

/** Batch m6, in doc order. */
const ASSIGNED = ['night-market', 'bubble-tea-shop', 'donut-shop', 'tuk-tuk', 'flower-cart', 'clothes-stall', 'street-tree', 'fruit-basket', 'veg-crate'];

describe('market batch m6', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(MARKET_DOC, 'm6')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, MARKET_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
