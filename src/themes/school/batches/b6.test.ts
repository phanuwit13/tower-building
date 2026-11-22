import { describe, expect, it } from 'vitest';
import { getStyleKit } from '../../../models/kit';
import { validateBatch } from './batch.test-helper';
import { items } from './b6';

/** Batch 6: trash-bins, drinking-fountain, bell-stand, globe-stand, signpost, handwash-trough. */
const ASSIGNED = ['trash-bins', 'drinking-fountain', 'bell-stand', 'globe-stand', 'signpost', 'handwash-trough'];

describe('school batch 6', () => {
  it('every item is valid, unique, assigned to this batch and has the documented footprint', () => {
    expect(validateBatch(items, getStyleKit(), ASSIGNED)).toEqual([]);
  });

  // The integration step makes this strict (drop the guard); until then an empty batch passes.
  it('has every assigned id once the batch is started', () => {
    if (items.length === 0) return;
    expect(items.map((i) => i.id).sort()).toEqual([...ASSIGNED].sort());
  });
});
