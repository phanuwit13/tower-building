import { describe, expect, it } from 'vitest';
import amusementMarkdown from '../../docs/game/items-amusement.md?raw';
import schoolMarkdown from '../../docs/game/items-school.md?raw';
import type { ItemModel } from '../models/contract';
import { getStyleKit } from '../models/kit';
import { batchIds, itemDoc, parseItemTable, validateBatch } from './batchHelper';
import { AMUSEMENT_MIX, DEFAULT_MIX } from './mix';
import { school } from './school';

const kit = getStyleKit();

/** A School-style table (an Exists column) and an Amusement-style one (Batch and Animation columns). */
const SCHOOL_STYLE = [
  'Intro text | with a pipe that is not a table.',
  '',
  '| # | id | Thai name | Footprint | Category | Exists | Description |',
  '|---|---|---|---|---|---|---|',
  '| 1 | `tree` | ต้นไม้ | 1×1 | nature | yes | x |',
  '| 2 | `trash-bins` | ถังขยะ | 1×1 | facility | no | x |',
  '| 3 | `library` | ห้องสมุด | 2×3 | building | no | x |',
].join('\n');
const AMUSEMENT_STYLE = [
  '| # | id | Thai name | Footprint | Category | Batch | Animation | Description |',
  '|---|---|---|---|---|---|---|---|',
  '| 1 | `ferris-wheel` | ชิงช้าสวรรค์ | 2×3 | ride | a1 | chase | wheel |',
  '| 2 | `carousel` | ม้าหมุน | 2×2 | ride | a1 | spin, chase | roof |',
  '| 3 | `drop-tower` | หอคอยดิ่ง | 2×2 | ride | a2 | chase | tower |',
].join('\n');

const doc = itemDoc('docs/game/items-test.md', SCHOOL_STYLE);

/** A real, valid 1x1 model (the School tree) under another id and name. */
const sample = (id: string, name: string, fp = { w: 1, d: 1 }): ItemModel => ({ ...school.items.find((i) => i.id === 'tree')!, id, name, footprint: fp });

/** Footprint counts of a parsed doc, as a FootprintMix ("1x2" also counts a "2x1"). */
const mixOf = (rows: Iterable<{ footprint: string }>) => {
  const counts: Record<string, number> = { '1x1': 0, '1x2': 0, '2x2': 0, '2x3': 0 };
  for (const { footprint } of rows) {
    const [a, b] = footprint.split('x').map(Number).sort();
    counts[`${a}x${b}`]++;
  }
  return counts;
};

describe('parseItemTable', () => {
  it('reads id, Thai name, footprint and the Exists flag of a School-style table', () => {
    const t = parseItemTable(SCHOOL_STYLE);
    expect(t.get('tree')).toEqual({ name: 'ต้นไม้', footprint: '1x1', exists: true });
    expect(t.get('library')).toEqual({ name: 'ห้องสมุด', footprint: '2x3', exists: false });
    expect([...t.keys()]).toEqual(['tree', 'trash-bins', 'library']); // doc order
  });
  it('reads the Batch column of an Amusement-style table, by header name (not by position)', () => {
    const t = parseItemTable(AMUSEMENT_STYLE);
    expect(t.get('carousel')).toEqual({ name: 'ม้าหมุน', footprint: '2x2', batch: 'a1' });
    expect(t.get('drop-tower')?.batch).toBe('a2');
  });
  it('fails loudly on a doc it cannot read rather than skipping rows', () => {
    expect(() => parseItemTable('no table here')).toThrow(/no item table/);
    expect(() => parseItemTable(SCHOOL_STYLE.replace('| 1×1 | nature', '| one | nature'))).toThrow(/tree.*footprint/);
    expect(() => parseItemTable(`${SCHOOL_STYLE}\n| 4 | \`tree\` | ต้นไม้ | 1×1 | nature | yes | x |`)).toThrow(/tree.*twice/);
  });
  it('parses the real School doc: 50 items, all built, the School mix', () => {
    const t = parseItemTable(schoolMarkdown);
    expect(t.size).toBe(50);
    expect([...t.values()].filter((r) => r.exists)).toHaveLength(50);
    expect(mixOf(t.values())).toEqual({ ...DEFAULT_MIX });
  });
  it('parses the real Amusement doc: 53 items in batches a1..a6, the Amusement mix', () => {
    const t = parseItemTable(amusementMarkdown);
    expect(t.size).toBe(53);
    expect(mixOf(t.values())).toEqual({ ...AMUSEMENT_MIX });
    const amusement = itemDoc('docs/game/items-amusement.md', amusementMarkdown);
    const sizes = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map((b) => batchIds(amusement, b).length);
    expect(sizes).toEqual([9, 9, 9, 9, 9, 8]);
    // every row belongs to one of the six batches, and the batches follow one another down the doc
    expect(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].flatMap((b) => batchIds(amusement, b))).toEqual([...t.keys()]);
  });
});

describe('batchIds', () => {
  it("lists a batch's ids in doc order; none for a doc without a Batch column", () => {
    const amusement = itemDoc('x.md', AMUSEMENT_STYLE);
    expect(batchIds(amusement, 'a1')).toEqual(['ferris-wheel', 'carousel']);
    expect(batchIds(amusement, 'a9')).toEqual([]);
    expect(batchIds(doc, 'a1')).toEqual([]);
  });
});

describe('validateBatch', () => {
  it('passes a valid assigned item', () => {
    expect(validateBatch([sample('trash-bins', 'ถังขยะ')], kit, ['trash-bins'], doc)).toEqual([]);
  });
  it('passes an empty batch', () => {
    expect(validateBatch([], kit, ['trash-bins'], doc)).toEqual([]);
  });
  it('fails an id that belongs to another batch (or an item built earlier)', () => {
    expect(validateBatch([sample('tree', 'ต้นไม้')], kit, ['trash-bins'], doc).join()).toMatch(/not assigned to this batch/);
  });
  it('fails a duplicate id within the batch', () => {
    const twice = [sample('trash-bins', 'ถังขยะ'), sample('trash-bins', 'ถังขยะ')];
    expect(validateBatch(twice, kit, ['trash-bins'], doc).join()).toMatch(/duplicate id/);
  });
  it('fails a footprint that differs from the doc', () => {
    expect(validateBatch([sample('trash-bins', 'ถังขยะ', { w: 1, d: 2 })], kit, ['trash-bins'], doc).join()).toMatch(/does not match the doc/);
  });
  it('fails a Thai name that differs from the doc', () => {
    expect(validateBatch([sample('trash-bins', 'ถังขยะใบใหญ่')], kit, ['trash-bins'], doc).join()).toMatch(/name "ถังขยะใบใหญ่" does not match the doc \(ถังขยะ\)/);
  });
  it('fails an id the doc does not have, naming the doc', () => {
    expect(validateBatch([sample('rocket', 'จรวด')], kit, ['rocket'], doc).join()).toMatch(/not in docs\/game\/items-test\.md/);
  });
  it('fails an invalid model (validateItemModel errors are included)', () => {
    const bad: ItemModel = { ...sample('trash-bins', 'ถังขยะ'), name: '' };
    expect(validateBatch([bad], kit, ['trash-bins'], doc).join()).toMatch(/name is empty/);
  });
  it('works the same against the Amusement doc', () => {
    const amusement = itemDoc('docs/game/items-amusement.md', amusementMarkdown);
    const a1 = batchIds(amusement, 'a1');
    expect(validateBatch([sample('light-pole', 'เสาไฟประดับ')], kit, a1, amusement)).toEqual([]);
    expect(validateBatch([sample('height-sign', 'ป้ายวัดส่วนสูง')], kit, a1, amusement).join()).toMatch(/not assigned to this batch/);
  });
});
