import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { HOSPITAL_DOC } from './batch.test-helper';
import { items } from './h1';

/** Batch h1, in doc order. */
const ASSIGNED = ['reception-desk', 'waiting-area', 'vending-corner', 'gift-shop-corner', 'bench-seats', 'info-kiosk', 'water-dispenser', 'sanitizer-stand', 'umbrella-stand'];

describe('hospital batch h1', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(HOSPITAL_DOC, 'h1')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, HOSPITAL_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
