import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { AMUSEMENT_DOC } from './batch.test-helper';
import { items } from './a2';

/** Batch a2, in doc order. */
const ASSIGNED = ['roller-coaster', 'swing-ride', 'drop-tower', 'duck-fishing', 'ice-cream-truck', 'height-sign', 'coin-horse', 'coin-rocket', 'umbrella-table'];

describe('amusement batch a2', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(AMUSEMENT_DOC, 'a2')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, AMUSEMENT_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
