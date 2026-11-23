// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { focusForKeyboard, focusReturn, installPointerFocusReturn, keyboardActive, trapTab } from './focus';

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
  it('focusReturn gives the focus back only to what the keyboard opened', () => {
    const b = document.body.appendChild(document.createElement('button'));
    document.dispatchEvent(new Event('pointerdown'));
    const byMouse = focusReturn(b);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); // the closing Esc is a key, but that is not how it was opened
    byMouse();
    expect(document.activeElement).not.toBe(b);
    const byKey = focusReturn(b);
    byKey();
    expect(document.activeElement).toBe(b);
  });
  it('trapTab wraps Tab and Shift+Tab inside the box', () => {
    const box = document.body.appendChild(document.createElement('div'));
    const a = box.appendChild(document.createElement('button'));
    const z = box.appendChild(document.createElement('button'));
    const key = (shiftKey: boolean) => { const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true }); trapTab(e, box); return e; };
    z.focus();
    expect(key(false).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(a);
    expect(key(true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(z);
    a.focus();
    expect(key(false).defaultPrevented).toBe(false); // in the middle: the browser moves on by itself
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
