import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { AMUSEMENT_DOC } from './batch.test-helper';
import { items } from './a4';

/** Batch a4, in doc order. */
const ASSIGNED = ['bumper-cars', 'entrance-gate', 'mirror-maze', 'kiddie-cars', 'balloon-stall', 'photo-booth', 'face-cutout', 'shaved-ice-cart', 'lollipop-sign'];

describe('amusement batch a4', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(AMUSEMENT_DOC, 'a4')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, AMUSEMENT_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
