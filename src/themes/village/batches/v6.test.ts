import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { VILLAGE_DOC } from './batch.test-helper';
import { items } from './v6';

/** Batch v6, in doc order. */
const ASSIGNED = ['village-hall', 'takraw-court', 'mushroom-house', 'roadside-sala', 'ox-cart', 'loudspeaker-pole', 'lantern-post', 'swing'];

describe('village batch v6', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(VILLAGE_DOC, 'v6')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, VILLAGE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
