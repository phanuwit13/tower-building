import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { batchIds, validateBatch } from '../../batchHelper';
import { HOSPITAL_DOC } from './batch.test-helper';
import { items } from './h3';

/** Batch h3, in doc order. */
const ASSIGNED = ['nurse-station', 'recovery-bed', 'exam-room', 'hospital-bed', 'stretcher', 'wheelchair-pair', 'screen-divider', 'heart-monitor', 'aed-box'];

describe('hospital batch h3', () => {
  it('is the batch the doc assigns', () => {
    expect(batchIds(HOSPITAL_DOC, 'h3')).toEqual(ASSIGNED);
  });

  it('every item is valid, unique, assigned to this batch and has the documented Thai name and footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED, HOSPITAL_DOC)).toEqual([]);
  });

  // Skipped only while the batch is empty (the scaffold): once it has an item it must be complete, in doc order.
  it.skipIf(items.length === 0)('has every assigned id, in doc order', () => {
    expect(items.map((i) => i.id)).toEqual(ASSIGNED);
  });
});
