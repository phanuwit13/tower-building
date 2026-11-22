// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { showNotice } from './notices';

describe('showNotice', () => {
  afterEach(() => vi.useRealTimers());
  it('stacks notices and removes each after ms', () => {
    vi.useFakeTimers();
    const root = document.createElement('div');
    showNotice(root, 'หนึ่ง', 1000);
    showNotice(root, 'สอง', 3000);
    expect(root.querySelectorAll('.notice')).toHaveLength(2);
    vi.advanceTimersByTime(1000);
    expect(root.textContent).toBe('สอง');
    vi.advanceTimersByTime(2000);
    expect(root.querySelectorAll('.notice')).toHaveLength(0);
  });
});
