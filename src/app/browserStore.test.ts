import { describe, expect, it } from 'vitest';
import { browserStore, memoryStore } from './browserStore';

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
  it('memoryStore starts from its seed and keeps writes to itself', () => {
    const seed = { a: '1' };
    const store = memoryStore(seed);
    expect(store.getItem('a')).toBe('1');
    expect(store.getItem('b')).toBeNull();
    store.setItem('b', '2');
    store.removeItem('a');
    expect(store.getItem('b')).toBe('2');
    expect(store.getItem('a')).toBeNull();
    expect(seed).toEqual({ a: '1' });
  });
});
