import type { KeyValueStore } from '../game/save';

/**
 * Accessing `localStorage` itself can throw (Safari with storage blocked, school policy): then
 * reads are empty and writes throw, so the game plays and shows the save-failed notice.
 * `getStorage` is injected (`() => window.localStorage`) to keep this layer free of the DOM.
 */
export function browserStore(getStorage: () => KeyValueStore): KeyValueStore {
  try {
    const ls = getStorage();
    return {
      getItem: (k) => ls.getItem(k),
      setItem: (k, v) => ls.setItem(k, v),
      removeItem: (k) => ls.removeItem(k),
    };
  } catch {
    return {
      getItem: () => null,
      setItem: () => { throw new Error('storage unavailable'); },
      removeItem: () => { throw new Error('storage unavailable'); },
    };
  }
}
