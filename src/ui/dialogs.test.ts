// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { confirmDialog } from './dialogs';
import { T } from './strings';

const find = (root: HTMLElement, text: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent === text) as HTMLButtonElement;

describe('confirmDialog', () => {
  it('is an accessible modal and focuses confirm', () => {
    const root = document.body.appendChild(document.createElement('div'));
    void confirmDialog(root, { message: T.confirmRestart, confirmLabel: T.confirmRestartOk });
    const d = root.querySelector('[role="dialog"]')!;
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.textContent).toContain(T.confirmRestart);
    expect(document.activeElement).toBe(find(root, T.confirmRestartOk));
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
});
