import type { ItemModel } from '../models/contract';
import type { StyleKit } from '../models/kit';
import { validateItemModel } from '../models/validate';

/**
 * Sculptor batches, for every theme: a theme's item doc (`docs/game/items-<theme>.md`) fixes each
 * item's id, Thai name, footprint and (from Amusement on) the batch that owns it; a batch test
 * checks the batch's items against it. Pure: the caller imports the doc (`?raw`) and passes it in.
 */

/** One row of a theme's item table. */
export interface DocRow {
  /** The Thai name, as the item's `name` must spell it. */
  name: string;
  /** `w x d` at rotation 0, ASCII x: "2x3". */
  footprint: string;
  /** The Exists column (School's doc), when the table has one. */
  exists?: boolean;
  /** The Batch column ("a1"), when the table has one. */
  batch?: string;
}

/** A parsed item doc and its repo path (error messages name it). */
export interface ItemDoc { path: string; rows: ReadonlyMap<string, DocRow> }

/** Header cells (lower case) the table must have, and the ones read when present. */
const REQUIRED = ['#', 'id', 'thai name', 'footprint'] as const;

/**
 * Pure: id -> row of a doc's item table, in doc order. Columns are found by their header names
 * (`| # | id | Thai name | Footprint | ... |`, plus `Exists` or `Batch` if the doc has them), so
 * every theme's doc can add its own columns. Throws on a doc with no such table, a footprint that
 * is not `w×d`, or an id listed twice.
 */
export function parseItemTable(md: string): Map<string, DocRow> {
  const rows = new Map<string, DocRow>();
  let col: Record<string, number> | null = null;
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (!col) {
      const names = cells.map((c) => c.toLowerCase());
      if (REQUIRED.every((h) => names.includes(h))) col = Object.fromEntries(names.map((n, i) => [n, i]));
      continue;
    }
    if (!/^\d+$/.test(cells[col['#']] ?? '')) continue; // the |---| rule
    const id = cells[col.id].replace(/`/g, '');
    const fp = /^(\d)\s*[×x]\s*(\d)$/.exec(cells[col.footprint] ?? '');
    if (!fp) throw new Error(`item doc: "${id}": footprint "${cells[col.footprint]}" is not w×d`);
    if (rows.has(id)) throw new Error(`item doc: "${id}" is listed twice`);
    const row: DocRow = { name: cells[col['thai name']], footprint: `${fp[1]}x${fp[2]}` };
    if (col.exists !== undefined) row.exists = cells[col.exists].toLowerCase() === 'yes';
    if (col.batch !== undefined) row.batch = cells[col.batch];
    rows.set(id, row);
  }
  if (!col) throw new Error(`item doc: no item table (a header row with ${REQUIRED.join(', ')})`);
  return rows;
}

/** Parse a theme's item doc; `path` is its repo path, for messages ("docs/game/items-school.md"). */
export function itemDoc(path: string, md: string): ItemDoc {
  return { path, rows: parseItemTable(md) };
}

/** The ids the doc's Batch column gives `batch`, in doc order (none when the doc has no Batch column). */
export function batchIds(doc: ItemDoc, batch: string): string[] {
  return [...doc.rows].filter(([, row]) => row.batch === batch).map(([id]) => id);
}

/**
 * Check one batch of items: every item passes validateItemModel, its id is assigned to this batch
 * (so an id owned by another batch fails) and not duplicated, and its Thai name and footprint are
 * the ones the doc fixes for that id. Returns every error (empty = valid).
 */
export function validateBatch(items: readonly ItemModel[], kit: StyleKit, assigned: readonly string[], doc: ItemDoc): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const tag = `item "${it.id}"`;
    if (seen.has(it.id)) errs.push(`${tag}: duplicate id within the batch`);
    seen.add(it.id);
    const row = doc.rows.get(it.id);
    if (!assigned.includes(it.id)) errs.push(`${tag}: id is not assigned to this batch`);
    if (!row) errs.push(`${tag}: id is not in ${doc.path}`);
    else {
      const got = `${it.footprint.w}x${it.footprint.d}`;
      if (got !== row.footprint) errs.push(`${tag}: footprint ${got} does not match the doc (${row.footprint})`);
      if (it.name !== row.name) errs.push(`${tag}: name "${it.name}" does not match the doc (${row.name})`);
    }
    errs.push(...validateItemModel(it, kit));
  }
  return errs;
}
