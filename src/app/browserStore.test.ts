import { describe, expect, it } from 'vitest';
import { browserStore } from './browserStore';

describe('browserStore', () => {
  it('delegates to the storage object', () => {
    const map = new Map<string, string>();
    const store = browserStore(() => ({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: (k) => void map.delete(k),
    }));
    store.setItem('a', '1');
    expect(store.getItem('a')).toBe('1');
    store.removeItem('a');
    expect(store.getItem('a')).toBeNull();
  });
  it('accessing localStorage itself throws: reads are empty, writes fail visibly', () => {
    const fakeWindow = { get localStorage(): never { throw new DOMException('denied', 'SecurityError'); } };
    const store = browserStore(() => fakeWindow.localStorage);
    expect(store.getItem('a')).toBeNull();
    expect(() => store.setItem('a', '1')).toThrow();
    expect(() => store.removeItem('a')).toThrow();
  });
});
