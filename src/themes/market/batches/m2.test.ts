import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { MARKET_DOC } from './batch.test-helper';
import { items } from './m2';

/** Batch m2, in doc order. */
const ASSIGNED = ['fresh-market', 'cinema', 'flower-shop', 'toy-store', 'newsstand', 'atm-kiosk', 'mailbox', 'fire-hydrant', 'a-frame-sign'];

describe('market batch m2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(MARKET_DOC, 'm2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, MARKET_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
