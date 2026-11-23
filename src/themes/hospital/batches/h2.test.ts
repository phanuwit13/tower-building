import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { HOSPITAL_DOC } from './batch.test-helper';
import { items } from './h2';

/** Batch h2, in doc order. */
const ASSIGNED = ['kids-ward-beds', 'playroom', 'reading-corner', 'baby-nursery', 'art-wall', 'bookshelf-low', 'toy-car', 'rocking-horse', 'teddy-bear'];

describe('hospital batch h2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(HOSPITAL_DOC, 'h2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, HOSPITAL_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
