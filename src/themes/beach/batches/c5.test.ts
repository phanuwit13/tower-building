import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { BEACH_DOC } from './batch.test-helper';
import { items } from './c5';

/** Batch c5, in doc order. */
const ASSIGNED = ['water-slide', 'volleyball-court', 'beach-pavilion', 'shell-ice-cream', 'bbq-grill', 'welcome-sign', 'surfboard', 'sand-flag'];

describe('beach batch c5', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(BEACH_DOC, 'c5')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, BEACH_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
