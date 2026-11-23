import type { ItemModel } from '../models/contract';
import { getTheme } from '../themes/registry';
import type { ThemeDef } from '../themes/types';

export const BATCH_COUNT = 6;

/** One sculptor batch of one theme. */
export interface BatchRequest { theme: string; n: number }

/**
 * Pure: `?gallery=<themeId>-batch-<n>` (n = 1..6) -> { theme, n }; the older `batch-<n>` means the
 * School's. null for anything else (a theme id, `floors`, `batch-0`, `batch-7`, `amusement-batch-1x`).
 */
export function parseBatchParam(param: string | null): BatchRequest | null {
  const m = param === null ? null : /^(?:([a-z]+)-)?batch-([1-9])$/.exec(param);
  const n = m ? Number(m[2]) : 0;
  return m && n >= 1 && n <= BATCH_COUNT ? { theme: m[1] ?? 'school', n } : null;
}

type Loaders = Record<string, () => Promise<unknown>>;

/** Where the gallery finds batches and themes (fixtures in tests). */
export interface BatchSources {
  /** Batch modules by path, `../themes/<theme>/batches/<letter><n>.ts` (School b1, Amusement a1, ...), loaded lazily. */
  batches: Loaders;
  /** `../themes/<theme>/info.ts` (exports `info`: the theme without its items), for a theme not registered yet. */
  infos: Loaders;
  /** A registered theme by id. */
  registered(id: string): ThemeDef | undefined;
}

// Lazy: one dynamic import per file, so only the requested batch (and theme info) is fetched. DEV only; production gets none.
const DEV_SOURCES: BatchSources = {
  batches: import.meta.env.DEV ? import.meta.glob('../themes/*/batches/[a-z][1-9].ts') : {},
  infos: import.meta.env.DEV ? import.meta.glob('../themes/*/info.ts') : {},
  registered: getTheme,
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * DEV: one batch of a theme, as a theme reduced to that batch's items (named `<theme> · batch <n>`),
 * and the batch's file. A theme not registered yet comes from its info module, never its index, so
 * another sculptor's batch is not loaded. Rejects (caller shows a message) when the batch or theme
 * is missing or broken.
 */
export async function loadBatch(req: BatchRequest, sources: BatchSources = DEV_SOURCES): Promise<{ theme: ThemeDef; file: string }> {
  const path = new RegExp(`^\\.\\./themes/${escape(req.theme)}/batches/[a-z]${req.n}\\.ts$`);
  const keys = Object.keys(sources.batches).filter((k) => path.test(k));
  if (keys.length !== 1) throw new Error(`no batch module for ${req.theme} batch ${req.n}${keys.length > 1 ? ` (${keys.join(', ')})` : ''}`);
  const [mod, base] = await Promise.all([sources.batches[keys[0]]() as Promise<{ items?: readonly ItemModel[] }>, themeInfo(req.theme, sources)]);
  if (!Array.isArray(mod.items)) throw new Error(`${req.theme} batch ${req.n} does not export "items"`);
  return { theme: { ...base, name: `${base.name} · batch ${req.n}`, items: mod.items }, file: keys[0].replace(/^\.\.\//, 'src/') };
}

async function themeInfo(id: string, sources: BatchSources): Promise<Omit<ThemeDef, 'items'>> {
  const registered = sources.registered(id);
  if (registered) return registered;
  const load = sources.infos[`../themes/${id}/info.ts`];
  const info = load ? ((await load()) as { info?: Omit<ThemeDef, 'items'> }).info : undefined;
  if (!info || info.id !== id) throw new Error(`no theme "${id}": register it, or add src/themes/${id}/info.ts exporting info`);
  return info;
}
