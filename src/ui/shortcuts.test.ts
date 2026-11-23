// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { memoryStore } from '../app/browserStore';
import type { KeyValueStore } from '../game/save';
import { createShortcutsPanel, SHORTCUTS_KEY, type ShortcutsOptions } from './shortcuts';
import { T } from './strings';

const press = (key: string, target: EventTarget = document) => {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e;
};

describe('shortcuts list', () => {
  afterEach(() => { document.body.innerHTML = ''; });
  const setup = (o: ShortcutsOptions = {}) => {
    const root = document.body.appendChild(document.createElement('div'));
    const panel = createShortcutsPanel(root, o);
    const head = root.querySelector<HTMLButtonElement>('.sc-head')!;
    const body = root.querySelector<HTMLElement>('.sc-body')!;
    return { root, panel, head, body };
  };

  it('lists every key of the game in a labelled region, not a dialog', () => {
    const { root } = setup();
    const text = root.textContent!;
    for (const w of ['Enter', 'Space', 'วาง', 'R', 'หมุนของ', 'เลื่อน', 'Q', 'E', 'หมุนกล้อง', 'ซูม', 'Esc', 'ปิด / ยกเลิก', 'ซ่อน / แสดงรายการนี้']) expect(text).toContain(w);
    const region = root.querySelector('aside')!;
    expect(region.getAttribute('aria-label')).toBe(T.shortcuts.title);
    expect(root.querySelector('[role="dialog"], [aria-modal]')).toBeNull();
    expect(root.querySelector('.sc-note')!.textContent).toBe(T.shortcuts.note);
  });

  it('is shown from the start; its header hides the list down to the header and shows it again', () => {
    const { panel, head, body } = setup();
    expect(panel.isShown()).toBe(true);
    expect(body.hidden).toBe(false);
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect(head.getAttribute('aria-controls')).toBe(body.id);
    head.click();
    expect(panel.isShown()).toBe(false);
    expect(body.hidden).toBe(true);
    expect(head.hidden).toBe(false); // the header stays, to bring the list back
    expect(head.getAttribute('aria-expanded')).toBe('false');
    head.click();
    expect(panel.isShown()).toBe(true);
    expect(body.hidden).toBe(false);
  });

  it('? hides and shows it; Esc and the game keys pass by untouched', () => {
    const { panel } = setup();
    expect(press('?').defaultPrevented).toBe(true);
    expect(panel.isShown()).toBe(false);
    press('?');
    expect(panel.isShown()).toBe(true);
    for (const key of ['Escape', 'Enter', ' ', 'ArrowRight', 'r', 'q']) {
      expect(press(key).defaultPrevented, key).toBe(false);
      expect(panel.isShown(), key).toBe(true);
    }
    panel.toggle(); // ⌨️ on the toolbar
    expect(panel.isShown()).toBe(false);
  });

  it('? rests while a dialog owns the page, while typing in a field, with a modifier, and on theme select', () => {
    let free = false;
    const { panel } = setup({ canToggle: () => free });
    press('?');
    expect(panel.isShown()).toBe(true);
    free = true;
    const input = document.body.appendChild(document.createElement('input'));
    press('?', input);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', ctrlKey: true, bubbles: true }));
    expect(panel.isShown()).toBe(true);
    panel.setVisible(false);
    press('?');
    expect(panel.isShown()).toBe(true);
    panel.setVisible(true);
    press('?');
    expect(panel.isShown()).toBe(false);
  });

  it('setVisible(false) takes the whole panel off the page (theme select)', () => {
    const { root, panel } = setup();
    panel.setVisible(false);
    expect(root.querySelector<HTMLElement>('aside')!.hidden).toBe(true);
    panel.setVisible(true);
    expect(root.querySelector<HTMLElement>('aside')!.hidden).toBe(false);
  });

  it('remembers a hidden list for the next visit, and shows it again once shown', () => {
    const store = memoryStore({});
    setup({ store }).head.click();
    expect(store.getItem(SHORTCUTS_KEY)).toBe('hidden');
    document.body.innerHTML = '';
    const again = setup({ store });
    expect(again.panel.isShown()).toBe(false);
    expect(again.body.hidden).toBe(true);
    again.head.click();
    expect(store.getItem(SHORTCUTS_KEY)).toBe('shown');
  });

  it('works when the storage throws: shown, and toggles in memory', () => {
    const broken: KeyValueStore = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    const { panel, head } = setup({ store: broken });
    expect(panel.isShown()).toBe(true);
    head.click();
    expect(panel.isShown()).toBe(false);
  });

  it('never moves the focus: the header keeps it for a keyboard user, the page keeps it otherwise', () => {
    const { head, panel } = setup();
    const before = document.activeElement;
    panel.toggle();
    panel.toggle();
    expect(document.activeElement).toBe(before);
    head.focus();
    head.click();
    expect(document.activeElement).toBe(head);
  });
});
