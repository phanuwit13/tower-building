import { describe, expect, it } from 'vitest';
import type { ItemModel } from '../../../models/contract';
import { getStyleKit } from '../../../models/kit';
import { school } from '../index';
import { parseItemTable, validateBatch } from './batch.test-helper';

const kit = getStyleKit();
const table = parseItemTable([
  '| # | id | Thai name | Footprint | Category | Exists | Description |',
  '|---|---|---|---|---|---|---|',
  '| 1 | `tree` | ต้นไม้ | 1×1 | nature | yes | x |',
  '| 2 | `trash-bins` | ถังขยะ | 1×1 | facility | no | x |',
  '| 3 | `library` | ห้องสมุด | 2×3 | building | no | x |',
].join('\n'));

/** A real, valid 1x1 model (the existing tree) under a new id. */
const sample = (id: string, fp = { w: 1, d: 1 }): ItemModel => ({ ...school.items.find((i) => i.id === 'tree')!, id, footprint: fp });

describe('parseItemTable', () => {
  it('reads id, footprint and the Exists flag', () => {
    expect(table.get('tree')).toEqual({ footprint: '1x1', exists: true });
    expect(table.get('library')).toEqual({ footprint: '2x3', exists: false });
    expect(table.size).toBe(3);
  });
  it('parses the real doc: 50 items, all built', () => {
    return import('../../../../docs/game/items-school.md?raw').then((m) => {
      const t = parseItemTable(m.default);
      expect(t.size).toBe(50);
      expect([...t.values()].filter((r) => r.exists)).toHaveLength(50);
    });
  });
});

describe('validateBatch', () => {
  it('passes a valid assigned item', () => {
    expect(validateBatch([sample('trash-bins')], kit, ['trash-bins'], table)).toEqual([]);
  });
  it('passes an empty batch', () => {
    expect(validateBatch([], kit, ['trash-bins'], table)).toEqual([]);
  });
  it('fails an id that belongs to another batch (or an item built earlier)', () => {
    expect(validateBatch([sample('tree')], kit, ['trash-bins'], table).join()).toMatch(/not assigned to this batch/);
  });
  it('fails a duplicate id within the batch', () => {
    expect(validateBatch([sample('trash-bins'), sample('trash-bins')], kit, ['trash-bins'], table).join()).toMatch(/duplicate id/);
  });
  it('fails a footprint that differs from the doc', () => {
    expect(validateBatch([sample('trash-bins', { w: 1, d: 2 })], kit, ['trash-bins'], table).join()).toMatch(/does not match the doc/);
  });
  it('fails an id not assigned to the batch', () => {
    expect(validateBatch([sample('library', { w: 2, d: 3 })], kit, ['trash-bins'], table).join()).toMatch(/not assigned/);
  });
  it('fails an invalid model (validateItemModel errors are included)', () => {
    const bad: ItemModel = { ...sample('trash-bins'), name: '' };
    expect(validateBatch([bad], kit, ['trash-bins'], table).join()).toMatch(/name is empty/);
  });
});
