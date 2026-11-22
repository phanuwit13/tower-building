import { describe, expect, it } from 'vitest';
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
  it('loads a batch module lazily', async () => {
    expect(Array.isArray(await loadBatch(1))).toBe(true);
  });
  it('rejects for an unknown batch', async () => {
    await expect(loadBatch(9)).rejects.toThrow();
  });
});
