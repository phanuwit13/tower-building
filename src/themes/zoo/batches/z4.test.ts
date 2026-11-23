import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { ZOO_DOC } from './batch.test-helper';
import { items } from './z4';

/** Batch z4, in doc order. */
const ASSIGNED = ['zoo-gate', 'flamingo-pond', 'bird-aviary', 'otter-stream', 'camel-pen', 'duck-tub', 'banana-crate', 'flower-bush'];

describe('zoo batch z4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(ZOO_DOC, 'z4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, ZOO_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
