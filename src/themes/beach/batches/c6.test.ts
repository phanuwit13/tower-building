import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { BEACH_DOC } from './batch.test-helper';
import { items } from './c6';

/** Batch c6, in doc order. */
const ASSIGNED = ['beach-hotel', 'pirate-play-ship', 'float-raft', 'bonfire', 'flamingo-float', 'jet-ski', 'seagull-post', 'coconut-pile', 'mini-umbrella'];

describe('beach batch c6', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(BEACH_DOC, 'c6')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, BEACH_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
