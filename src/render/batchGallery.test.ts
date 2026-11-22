import { describe, expect, it } from 'vitest';
import type { ItemModel } from '../models/contract';
import { loadBatch, parseBatchParam } from './batchGallery';

describe('parseBatchParam', () => {
  it('selects batches 1 to 6', () => {
    for (let n = 1; n <= 6; n++) expect(parseBatchParam(`batch-${n}`)).toBe(n);
  });
  it('ignores everything else', () => {
    for (const p of [null, '', 'school', 'batch-0', 'batch-7', 'batch-10', 'batch-', 'batch-1x', 'Batch-1', ' batch-1']) {
      expect(parseBatchParam(p)).toBeNull();
    }
  });
});

describe('loadBatch', () => {
  // Fixture loaders: this test must not depend on any real batch module.
  const fixture = { id: 'fixture' } as unknown as ItemModel;
  const key = (n: number): string => `../themes/school/batches/b${n}.ts`;
  it('loads a batch module lazily', async () => {
    let loaded = 0;
    const source = { [key(1)]: async () => { loaded++; return { items: [fixture] }; } };
    expect(loaded).toBe(0);
    expect(await loadBatch(1, source)).toEqual([fixture]);
    expect(loaded).toBe(1);
  });
  it('rejects for an unknown batch', async () => {
    await expect(loadBatch(9, {})).rejects.toThrow();
  });
  it('rejects when the module does not export items', async () => {
    await expect(loadBatch(1, { [key(1)]: async () => ({}) })).rejects.toThrow('items');
  });
});
