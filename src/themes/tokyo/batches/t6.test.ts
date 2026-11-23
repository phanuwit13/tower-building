import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { TOKYO_DOC } from './batch.test-helper';
import { items } from './t6';

/** Batch t6, in doc order. */
const ASSIGNED = ['arcade-center', 'cat-cafe', 'tea-house', 'koinobori-pole', 'lantern-row', 'wagasa-stand', 'shiba-dog', 'calico-cat'];

describe('tokyo batch t6', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(TOKYO_DOC, 't6')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, TOKYO_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
