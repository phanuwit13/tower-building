import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { TOKYO_DOC } from './batch.test-helper';
import { items } from './t1';

/** Batch t1, in doc order. */
const ASSIGNED = ['tokyo-tower', 'five-storey-pagoda', 'japanese-temple', 'japanese-garden', 'stone-lanterns', 'red-bridge', 'shishi-odoshi', 'rock-and-moss', 'japanese-pine'];

describe('tokyo batch t1', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(TOKYO_DOC, 't1')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, TOKYO_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
