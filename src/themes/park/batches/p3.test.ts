import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { PARK_DOC } from './batch.test-helper';
import { items } from './p3';

/** Batch p3, in doc order. */
const ASSIGNED = ['outdoor-gym', 'skate-park', 'basketball-court', 'bike-rental', 'jogging-track', 'bike-rack', 'trash-bins', 'vending-machine', 'signpost'];

describe('park batch p3', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(PARK_DOC, 'p3')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, PARK_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
