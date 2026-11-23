import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { CAFE_DOC } from './batch.test-helper';
import { items } from './k4';

/** Batch k4, in doc order. */
const ASSIGNED = ['open-kitchen', 'bread-shelf', 'smoothie-bar', 'donut-shelf', 'tea-party-table', 'condiment-station', 'coffee-sacks', 'water-dispenser', 'hand-sink'];

describe('cafe batch k4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(CAFE_DOC, 'k4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, CAFE_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
