// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { focusForKeyboard, installPointerFocusReturn, keyboardActive } from './focus';

describe('focus after pointer clicks', () => {
  let off: () => void;
  beforeEach(() => { off = installPointerFocusReturn(); });
  afterEach(() => { off(); document.body.innerHTML = ''; });

  it('a mouse click leaves no button focused, so Space reaches the game', () => {
    const b = document.body.appendChild(document.createElement('button'));
    document.dispatchEvent(new Event('pointerdown'));
    b.focus();
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(document.activeElement).toBe(document.body);
  });
  it('a keyboard click (detail 0) keeps the focus on the button', () => {
    const b = document.body.appendChild(document.createElement('button'));
    b.focus();
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(document.activeElement).toBe(b);
  });
  it('a slider let go by pointer gives the focus back; one used by keys keeps it', () => {
    const r = document.body.appendChild(document.createElement('input'));
    r.type = 'range';
    document.dispatchEvent(new Event('pointerdown'));
    r.focus();
    r.dispatchEvent(new Event('pointerup', { bubbles: true }));
    expect(document.activeElement).toBe(document.body);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    r.focus();
    r.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.activeElement).toBe(r);
  });
  it('code moves the focus only for keyboard users', () => {
    const b = document.body.appendChild(document.createElement('button'));
    document.dispatchEvent(new Event('pointerdown'));
    expect(keyboardActive()).toBe(false);
    focusForKeyboard(b);
    expect(document.activeElement).not.toBe(b);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    focusForKeyboard(b);
    expect(document.activeElement).toBe(b);
  });
});
