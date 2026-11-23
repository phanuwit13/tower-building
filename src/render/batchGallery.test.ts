import { describe, expect, it } from 'vitest';
import type { ItemModel } from '../models/contract';
import type { ThemeDef } from '../themes/types';
import { loadBatch, parseBatchParam, type BatchSources } from './batchGallery';

describe('parseBatchParam', () => {
  it('selects batches 1 to 6 of a theme: `<themeId>-batch-<n>`', () => {
    for (let n = 1; n <= 6; n++) {
      expect(parseBatchParam(`amusement-batch-${n}`)).toEqual({ theme: 'amusement', n });
      expect(parseBatchParam(`school-batch-${n}`)).toEqual({ theme: 'school', n });
    }
  });
  it('keeps `batch-<n>` for the School batches', () => {
    for (let n = 1; n <= 6; n++) expect(parseBatchParam(`batch-${n}`)).toEqual({ theme: 'school', n });
  });
  it('ignores everything else', () => {
    for (const p of [null, '', 'school', 'amusement', 'floors', 'batch-0', 'batch-7', 'batch-10', 'batch-', 'batch-1x', 'Batch-1', ' batch-1',
      'amusement-batch-0', 'amusement-batch-7', 'Amusement-batch-1', '-batch-1', 'amusement-batch', 'amusement_batch-1', 'a-b-batch-1']) {
      expect(parseBatchParam(p), String(p)).toBeNull();
    }
  });
});

describe('loadBatch', () => {
  // Fixture loaders: this test must not depend on any real batch module.
  const fixture = { id: 'fixture' } as unknown as ItemModel;
  const school: ThemeDef = { id: 'school', name: 'โรงเรียน', emoji: '🏫', defaultGround: 'grass', items: [fixture, fixture] };
  const info: Omit<ThemeDef, 'items'> = { id: 'amusement', name: 'สวนสนุก', emoji: '🎡', defaultGround: 'concrete' };
  const registered = (id: string) => (id === 'school' ? school : undefined);
  const sources = (batches: BatchSources['batches'], infos: BatchSources['infos'] = {}): BatchSources => ({ batches, infos, registered });

  it('loads a registered theme reduced to one batch, lazily', async () => {
    let loaded = 0;
    const src = sources({ '../themes/school/batches/b2.ts': async () => { loaded++; return { items: [fixture] }; } });
    expect(loaded).toBe(0);
    const got = await loadBatch({ theme: 'school', n: 2 }, src);
    expect(loaded).toBe(1);
    expect(got.theme).toEqual({ ...school, name: 'โรงเรียน · batch 2', items: [fixture] });
    expect(got.file).toBe('src/themes/school/batches/b2.ts');
  });
  it('loads a theme that is not registered yet from its info module (not its index: other batches stay unloaded)', async () => {
    let others = 0;
    const src = sources(
      { '../themes/amusement/batches/a3.ts': async () => ({ items: [] }), '../themes/amusement/batches/a4.ts': async () => { others++; return {}; } },
      { '../themes/amusement/info.ts': async () => ({ info }) });
    const got = await loadBatch({ theme: 'amusement', n: 3 }, src);
    expect(got.theme).toEqual({ ...info, name: 'สวนสนุก · batch 3', items: [] });
    expect(got.file).toBe('src/themes/amusement/batches/a3.ts');
    expect(others).toBe(0);
  });
  it('finds the batch whatever letter the theme gives its batch files, and never another theme\'s', async () => {
    const src = sources({ '../themes/school/batches/b1.ts': async () => ({ items: [fixture] }) },
      { '../themes/amusement/info.ts': async () => ({ info }) });
    await expect(loadBatch({ theme: 'amusement', n: 1 }, src)).rejects.toThrow(/no batch module for amusement batch 1/);
  });
  it('rejects an unknown batch or theme', async () => {
    await expect(loadBatch({ theme: 'school', n: 9 }, sources({}))).rejects.toThrow(/no batch module/);
    await expect(loadBatch({ theme: 'zoo', n: 1 }, sources({ '../themes/zoo/batches/z1.ts': async () => ({ items: [] }) })))
      .rejects.toThrow(/no theme "zoo"/);
  });
  it('rejects when the module does not export items', async () => {
    await expect(loadBatch({ theme: 'school', n: 1 }, sources({ '../themes/school/batches/b1.ts': async () => ({}) }))).rejects.toThrow('items');
  });
});
