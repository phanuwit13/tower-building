import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { PARK_DOC } from './batch.test-helper';
import { items } from './p2';

/** Batch p2, in doc order. */
const ASSIGNED = ['playground', 'sandpit', 'climbing-dome', 'seesaw', 'slide', 'swings', 'spring-riders', 'mushroom-stools', 'park-dog'];

describe('park batch p2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(PARK_DOC, 'p2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, PARK_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
