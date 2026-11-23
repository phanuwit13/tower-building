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
  it('counts batches per theme from the batch modules', () => {
    const paths = [1, 2, 3, 4, 5, 6].map((n) => `../themes/school/batches/b${n}.ts`)
      .concat([1, 2, 3, 4, 5, 6, 7].map((n) => `../themes/zoo/batches/z${n}.ts`));
    expect(parseBatchParam('zoo-batch-7', paths)).toEqual({ theme: 'zoo', n: 7 });
    expect(parseBatchParam('zoo-batch-8', paths)).toBeNull();
    expect(parseBatchParam('zoo-batch-9', paths)).toBeNull();
    expect(parseBatchParam('batch-7', paths)).toBeNull();
    expect(parseBatchParam('school-batch-6', paths)).toEqual({ theme: 'school', n: 6 });
    expect(parseBatchParam('amusement-batch-1', paths)).toBeNull();
  });
  it('knows the real zoo has seven batches and School six', () => {
    expect(parseBatchParam('zoo-batch-7')).toEqual({ theme: 'zoo', n: 7 });
    expect(parseBatchParam('zoo-batch-8')).toBeNull();
    expect(parseBatchParam('batch-7')).toBeNull();
  });
  it('finds the beach batches (c-prefixed files c1-c7) without disturbing the other prefixes', () => {
    const paths = [1, 2, 3, 4, 5, 6, 7].map((n) => `../themes/beach/batches/c${n}.ts`)
      .concat([1, 2, 3, 4, 5, 6].map((n) => `../themes/school/batches/b${n}.ts`), [1, 2, 3, 4, 5, 6].map((n) => `../themes/amusement/batches/a${n}.ts`),
        [1, 2, 3, 4, 5, 6, 7].map((n) => `../themes/zoo/batches/z${n}.ts`));
    for (let n = 1; n <= 7; n++) expect(parseBatchParam(`beach-batch-${n}`, paths)).toEqual({ theme: 'beach', n });
    expect(parseBatchParam('beach-batch-8', paths)).toBeNull();
    expect(parseBatchParam('batch-6', paths)).toEqual({ theme: 'school', n: 6 });
    expect(parseBatchParam('amusement-batch-6', paths)).toEqual({ theme: 'amusement', n: 6 });
    expect(parseBatchParam('zoo-batch-7', paths)).toEqual({ theme: 'zoo', n: 7 });
  });
  it('knows the real beach has seven batches', () => {
    expect(parseBatchParam('beach-batch-1')).toEqual({ theme: 'beach', n: 1 });
    expect(parseBatchParam('beach-batch-7')).toEqual({ theme: 'beach', n: 7 });
    expect(parseBatchParam('beach-batch-8')).toBeNull();
  });
  it('finds the market batches (m-prefixed files m1-m8) without disturbing the other prefixes', () => {
    const paths = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `../themes/market/batches/m${n}.ts`)
      .concat([1, 2, 3, 4, 5, 6].map((n) => `../themes/school/batches/b${n}.ts`), [1, 2, 3, 4, 5, 6, 7].map((n) => `../themes/beach/batches/c${n}.ts`));
    for (let n = 1; n <= 8; n++) expect(parseBatchParam(`market-batch-${n}`, paths)).toEqual({ theme: 'market', n });
    expect(parseBatchParam('market-batch-9', paths)).toBeNull();
    expect(parseBatchParam('batch-8', paths)).toBeNull();
    expect(parseBatchParam('beach-batch-8', paths)).toBeNull();
    expect(parseBatchParam('beach-batch-7', paths)).toEqual({ theme: 'beach', n: 7 });
  });
  it('knows the real market has eight batches', () => {
    expect(parseBatchParam('market-batch-1')).toEqual({ theme: 'market', n: 1 });
    expect(parseBatchParam('market-batch-8')).toEqual({ theme: 'market', n: 8 });
    expect(parseBatchParam('market-batch-9')).toBeNull();
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
  it('keeps the theme\'s night glow, so a batch is reviewed under its theme\'s real night', async () => {
    const city: Omit<ThemeDef, 'items'> = { id: 'market', name: 'ย่านการค้า', emoji: '🛍️', defaultGround: 'concrete', nightGlow: 1.5 };
    const src = sources({ '../themes/market/batches/m2.ts': async () => ({ items: [] }) }, { '../themes/market/info.ts': async () => ({ info: city }) });
    expect((await loadBatch({ theme: 'market', n: 2 }, src)).theme.nightGlow).toBe(1.5);
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
