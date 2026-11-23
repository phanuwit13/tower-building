import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { MARKET_DOC } from './batch.test-helper';
import { items } from './m4';

/** Batch m4, in doc order. */
const ASSIGNED = ['bookstore', 'pharmacy', 'stationery-shop', 'planter-box', 'vending-machines', 'banner-pole', 'gashapon', 'parking-meter', 'shop-cat'];

describe('market batch m4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(MARKET_DOC, 'm4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, MARKET_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
