// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createShortcutsPanel } from './shortcuts';
import { T } from './strings';

const press = (key: string, target: EventTarget = document) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('shortcuts panel', () => {
  afterEach(() => { document.body.innerHTML = ''; });
  const setup = (o = {}) => {
    const root = document.body.appendChild(document.createElement('div'));
    const panel = createShortcutsPanel(root, o);
    return { root, panel };
  };

  it('lists every key of the game', () => {
    const { root } = setup();
    const text = root.textContent!;
    for (const w of ['Enter', 'Space', 'วาง', 'R', 'หมุนของ', 'เลื่อน', 'Q', 'E', 'หมุนกล้อง', 'ซูม', 'Esc', 'ปิด / ยกเลิก']) expect(text).toContain(w);
    expect(root.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe(T.shortcuts.title);
  });

  it('opens and closes by ? , Esc and the close button, and reports it', () => {
    const onOpenChange = vi.fn();
    const { root, panel } = setup({ onOpenChange });
    press('?');
    expect(panel.isOpen()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    press('Escape');
    expect(panel.isOpen()).toBe(false);
    panel.open();
    root.querySelector<HTMLButtonElement>('.btn-close')!.click();
    expect(panel.isOpen()).toBe(false);
    press('?');
    press('?'); // toggles
    expect(panel.isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('a tap on the backdrop closes it; a tap inside the card does not', () => {
    const { root, panel } = setup();
    panel.open();
    root.querySelector('.shortcuts-card')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(panel.isOpen()).toBe(true);
    root.querySelector('.shortcuts')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(panel.isOpen()).toBe(false);
  });

  it('? does not open it while a dialog owns the page, or while typing in a field', () => {
    let free = false;
    const { panel } = setup({ canOpen: () => free });
    press('?');
    expect(panel.isOpen()).toBe(false);
    free = true;
    const input = document.body.appendChild(document.createElement('input'));
    press('?', input);
    expect(panel.isOpen()).toBe(false);
    press('?');
    expect(panel.isOpen()).toBe(true);
  });

  it('puts the focus on ✕ when opened and back on the opener when closed (keyboard)', () => {
    const { panel } = setup();
    const opener = document.body.appendChild(document.createElement('button'));
    opener.focus();
    panel.open();
    expect(document.activeElement!.className).toContain('btn-close');
    panel.close();
    expect(document.activeElement).toBe(opener);
  });
});
