import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { SPACE_DOC } from './batch.test-helper';
import { items } from './s1';

/** Batch s1, in doc order. */
const ASSIGNED = ['launch-pad', 'spaceport-runway', 'fuel-tanks', 'landing-pad-small', 'mini-rocket', 'lunar-lander', 'fuel-pump', 'beacon', 'mission-sign'];

describe('space batch s1', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(SPACE_DOC, 's1')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, SPACE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
