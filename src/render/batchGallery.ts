import type { ItemModel } from '../models/contract';

export const BATCH_COUNT = 6;

/** Pure: `?gallery=batch-<n>` (n = 1..6) -> n; null for anything else (a theme id, `batch-0`, `batch-7`, `batch-1x`). */
export function parseBatchParam(param: string | null): number | null {
  const m = param === null ? null : /^batch-([1-9])$/.exec(param);
  const n = m ? Number(m[1]) : 0;
  return n >= 1 && n <= BATCH_COUNT ? n : null;
}

// Lazy: one dynamic import per batch file, so only the requested batch is fetched. DEV only; production gets {}.
const loaders: Record<string, () => Promise<unknown>> = import.meta.env.DEV
  ? import.meta.glob('../themes/school/batches/b[1-6].ts')
  : {};

/** DEV: load one batch's items. Rejects (caller shows a message) when the module is missing or broken. */
export async function loadBatch(
  n: number, source: Record<string, () => Promise<unknown>> = loaders,
): Promise<readonly ItemModel[]> {
  const load = source[`../themes/school/batches/b${n}.ts`];
  if (!load) throw new Error(`no batch module for batch ${n}`);
  const mod = (await load()) as { items?: readonly ItemModel[] };
  if (!Array.isArray(mod.items)) throw new Error(`batch ${n} does not export "items"`);
  return mod.items;
}
