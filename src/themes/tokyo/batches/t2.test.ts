import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { TOKYO_DOC } from './batch.test-helper';
import { items } from './t2';

/** Batch t2, in doc order. */
const ASSIGNED = ['skyscraper-office', 'department-store', 'capsule-hotel', 'karaoke-building', 'neon-sign-tower', 'vending-machines', 'street-lamp', 'electric-pole', 'traffic-light'];

describe('tokyo batch t2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(TOKYO_DOC, 't2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, TOKYO_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
