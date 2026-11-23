// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmDialog } from './dialogs';
import { T } from './strings';

const find = (root: HTMLElement, text: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent === text) as HTMLButtonElement;

describe('confirmDialog', () => {
  afterEach(() => { document.body.innerHTML = ''; });
  it('is an accessible modal and focuses ยกเลิก (a stray Space or Enter must not wipe a city)', () => {
    const root = document.body.appendChild(document.createElement('div'));
    void confirmDialog(root, { message: T.confirmRestart, confirmLabel: T.confirmRestartOk });
    const d = root.querySelector('[role="dialog"]')!;
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.textContent).toContain(T.confirmRestart);
    expect(document.activeElement).toBe(find(root, T.cancel));
  });
  it('Tab stays inside the dialog', () => {
    const root = document.body.appendChild(document.createElement('div'));
    void confirmDialog(root, { message: 'm', confirmLabel: 'ok' });
    const ok = find(root, 'ok');
    ok.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(find(root, T.cancel)); // wrapped to the first button
  });
  it('resolves true on confirm and removes dialog', async () => {
    const root = document.createElement('div');
    const p = confirmDialog(root, { message: 'm', confirmLabel: 'ok' });
    find(root, 'ok').click();
    expect(await p).toBe(true);
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });
  it('resolves false on cancel', async () => {
    const root = document.createElement('div');
    const p = confirmDialog(root, { message: 'm', confirmLabel: 'ok' });
    find(root, T.cancel).click();
    expect(await p).toBe(false);
  });
  it('resolves false on Escape', async () => {
    const root = document.body.appendChild(document.createElement('div'));
    const p = confirmDialog(root, { message: 'm', confirmLabel: 'ok' });
    root.querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await p).toBe(false);
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });
  it('Escape on document cancels with focus on body, and listener is removed after', async () => {
    const root = document.body.appendChild(document.createElement('div'));
    const opener = document.body.appendChild(document.createElement('button'));
    opener.focus();
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const p = confirmDialog(root, { message: 'm', confirmLabel: 'ok' });
    (document.activeElement as HTMLElement).blur();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(await p).toBe(false);
    const added = add.mock.calls.find((c) => c[0] === 'keydown')![1];
    expect(remove.mock.calls.some((c) => c[0] === 'keydown' && c[1] === added)).toBe(true);
    expect(document.activeElement).toBe(opener);
    add.mockRestore(); remove.mockRestore();
  });
});
