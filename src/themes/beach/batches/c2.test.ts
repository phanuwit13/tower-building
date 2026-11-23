import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { BEACH_DOC } from './batch.test-helper';
import { items } from './c2';

/** Batch c2, in doc order. */
const ASSIGNED = ['sailboat-dock', 'seafood-restaurant', 'kayak-rack', 'coconut-bar', 'palm-hammock', 'boardwalk-bench', 'beach-ball', 'starfish', 'giant-shell'];

describe('beach batch c2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(BEACH_DOC, 'c2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, BEACH_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
