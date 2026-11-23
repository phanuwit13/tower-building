import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { AMUSEMENT_DOC } from './batch.test-helper';
import { items } from './a6';

/** Batch a6, in doc order. */
const ASSIGNED = ['haunted-house', 'giant-house', 'food-court', 'souvenir-shop', 'restrooms', 'shooting-gallery', 'parade-float', 'double-bench'];

describe('amusement batch a6', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(AMUSEMENT_DOC, 'a6')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, AMUSEMENT_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
