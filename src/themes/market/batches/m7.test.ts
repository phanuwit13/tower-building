import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { MARKET_DOC } from './batch.test-helper';
import { items } from './m7';

/** Batch m7, in doc order. */
const ASSIGNED = ['mall-food-court', 'optical-shop', 'sports-shop', 'meatball-grill', 'juice-stall', 'corn-cart', 'shopping-trolley', 'market-scale'];

describe('market batch m7', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(MARKET_DOC, 'm7')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, MARKET_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
