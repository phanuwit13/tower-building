import { describe, expect, it } from 'vitest';
import { memoryStore } from './browserStore';
import { SEEN_KEY, seenHints } from './hints';

describe('seenHints', () => {
  it('starts with nothing seen, remembers a mark and keeps it across page loads', () => {
    const store = memoryStore({});
    const first = seenHints(store);
    expect(first.has('placed')).toBe(false);
    expect(first.has('turned')).toBe(false);
    first.mark('placed');
    expect(first.has('placed')).toBe(true);
    expect(first.has('turned')).toBe(false);
    const reloaded = seenHints(store);
    expect(reloaded.has('placed')).toBe(true);
    expect(reloaded.has('turned')).toBe(false);
  });

  it('keeps every flag under one small key, and a second mark keeps the first', () => {
    const store = memoryStore({});
    const hints = seenHints(store);
    hints.mark('turned');
    hints.mark('placed');
    hints.mark('placed');
    expect(store.getItem(SEEN_KEY)?.split(',').sort()).toEqual(['placed', 'turned']);
  });

  it("does not lose another tab's flag when it marks its own", () => {
    const store = memoryStore({});
    const a = seenHints(store);
    const b = seenHints(store); // loaded before a marked anything
    a.mark('turned');
    b.mark('placed');
    const reloaded = seenHints(store);
    expect(reloaded.has('turned')).toBe(true);
    expect(reloaded.has('placed')).toBe(true);
  });

  it('ignores unknown or junk values', () => {
    const hints = seenHints(memoryStore({ [SEEN_KEY]: ' ,banana,,placed' }));
    expect(hints.has('placed')).toBe(true);
    expect(hints.has('turned')).toBe(false);
  });

  it('storage blocked: the hints show (nothing seen), a mark holds for this page and never throws', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    const hints = seenHints(blocked);
    expect(hints.has('turned')).toBe(false);
    expect(() => hints.mark('turned')).not.toThrow();
    expect(hints.has('turned')).toBe(true);
    expect(seenHints(blocked).has('turned')).toBe(false); // the next visit shows it again
  });
});
