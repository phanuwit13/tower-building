import type { KeyValueStore } from '../game/save';

/** One-time hints, remembered per browser: `placed` once any item was ever placed, `turned` once the camera was turned. */
export type Hint = 'placed' | 'turned';
export const SEEN_KEY = 'city-builder/seen';

export interface SeenHints {
  has(h: Hint): boolean;
  /** Never show `h` again (in this page even when storage is blocked; then the next visit shows it again). */
  mark(h: Hint): void;
}

/** The comma-separated flags saved under SEEN_KEY; unreadable storage reads as nothing seen. */
function read(store: KeyValueStore): Set<string> {
  try {
    return new Set((store.getItem(SEEN_KEY) ?? '').split(',').map((s) => s.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function seenHints(store: KeyValueStore): SeenHints {
  const seen = read(store);
  return {
    has: (h) => seen.has(h),
    mark(h) {
      if (seen.has(h)) return;
      seen.add(h);
      // Re-read first: another tab may have saved a flag of its own since this page loaded.
      const saved = read(store);
      for (const s of seen) saved.add(s);
      try {
        store.setItem(SEEN_KEY, [...saved].join(','));
      } catch {
        // storage blocked: the hint is gone for this page only
      }
    },
  };
}
