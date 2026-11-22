import type { ItemModel } from '../../../models/contract';
import type { StyleKit } from '../../../models/kit';
import { validateItemModel } from '../../../models/validate';
import itemsMarkdown from '../../../../docs/game/items-school.md?raw';

export interface DocRow { footprint: string; exists: boolean }

/** Pure: parse the item table of docs/game/items-school.md: id -> footprint ("2x3", ASCII x) and the Exists flag. */
export function parseItemTable(md: string): Map<string, DocRow> {
  const rows = new Map<string, DocRow>();
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    // | # | `id` | Thai name | 2×3 | category | yes/no | description |
    if (cells.length < 8 || !/^\d+$/.test(cells[1])) continue;
    const id = cells[2].replace(/`/g, '');
    const fp = /^(\d)\s*[×x]\s*(\d)$/.exec(cells[4]);
    if (!id || !fp) continue;
    rows.set(id, { footprint: `${fp[1]}x${fp[2]}`, exists: cells[6].toLowerCase() === 'yes' });
  }
  return rows;
}

const TABLE = parseItemTable(itemsMarkdown);

/** The six style-lock items built before the batches; batch sculptors must not reuse these ids. */
const STYLE_LOCK = new Set(['tree', 'street-lamp', 'flagpole', 'bench', 'swing-set', 'classroom']);

/**
 * Check one batch of School items: every item passes validateItemModel, its id is assigned to this
 * batch, not already built (Exists = yes in the doc) and not duplicated, and its footprint is the
 * one the doc fixes for that id. Returns every error (empty = valid).
 */
export function validateBatch(
  items: readonly ItemModel[], kit: StyleKit, assigned: readonly string[], table: ReadonlyMap<string, DocRow> = TABLE,
): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const tag = `item "${it.id}"`;
    if (seen.has(it.id)) errs.push(`${tag}: duplicate id within the batch`);
    seen.add(it.id);
    const row = table.get(it.id);
    if (row?.exists && STYLE_LOCK.has(it.id)) errs.push(`${tag}: id is already used by an existing School item`);
    if (!assigned.includes(it.id)) errs.push(`${tag}: id is not assigned to this batch`);
    if (!row) errs.push(`${tag}: id is not in docs/game/items-school.md`);
    else {
      const got = `${it.footprint.w}x${it.footprint.d}`;
      if (got !== row.footprint) errs.push(`${tag}: footprint ${got} does not match the doc (${row.footprint})`);
    }
    errs.push(...validateItemModel(it, kit));
  }
  return errs;
}
