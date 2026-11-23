import type { KeyValueStore } from '../game/save';
import { el } from './dom';
import { ICONS, lineIcon } from './icons';
import { T } from './strings';

/** True on a machine that most likely has a keyboard and a mouse: the ⌨️ button and the list only show there. */
export const hasFinePointer = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

/** 'hidden' once the player folded the list away; shown when nothing is saved. */
export const SHORTCUTS_KEY = 'city-builder/shortcuts';

export interface ShortcutsOptions {
  /** `?` shows or hides the list only while this says the page is free (no dialog, no end screen). */
  canToggle?: () => boolean;
  /** Keeps the shown/hidden choice; a store that throws only means the choice is not remembered. */
  store?: KeyValueStore;
}

/**
 * The ⌨️ list on the right edge: every key the game answers to, on screen the whole time a city is
 * open. It never takes the keyboard, so the game keys keep working beside it. Its header (and ⌨️ and
 * `?`) folds the list down to the header and opens it again, and the choice is remembered.
 */
export function createShortcutsPanel(root: HTMLElement, o: ShortcutsOptions = {}): {
  toggle(): void; isShown(): boolean; setVisible(v: boolean): void;
} {
  const rows = T.shortcuts.rows.map((r) =>
    el('li', {}, [
      el('span', { class: 'sc-keys' }, r.keys.map((k) => el('kbd', { text: k }))),
      el('span', { class: 'sc-does', text: r.does }),
    ]));
  const body = el('div', { class: 'sc-body', attrs: { id: 'shortcut-list' } }, [
    el('ul', { class: 'sc-list' }, rows),
    el('p', { class: 'sc-note', text: T.shortcuts.note }),
  ]);
  const head = el('button', { class: 'sc-head', attrs: { type: 'button', 'aria-controls': body.id }, onClick: () => toggle() }, [
    lineIcon(ICONS.keyboard, 'line-icon sc-icon'),
    el('span', { text: T.shortcuts.title }),
    lineIcon(ICONS.chevronDown, 'line-icon sc-chevron'),
  ]);
  const panel = el('aside', { class: 'shortcuts', attrs: { 'aria-label': T.shortcuts.title } }, [head, body]);
  root.appendChild(panel);

  let shown = true;
  try { shown = o.store?.getItem(SHORTCUTS_KEY) !== 'hidden'; } catch { /* unreadable storage: shown */ }
  const draw = (): void => {
    body.hidden = !shown;
    head.setAttribute('aria-expanded', String(shown));
  };
  draw();

  function toggle(): void {
    shown = !shown;
    draw();
    try { o.store?.setItem(SHORTCUTS_KEY, shown ? 'shown' : 'hidden'); } catch { /* not remembered, still toggles */ }
  }

  const typing = (t: EventTarget | null): boolean => {
    const e = t as HTMLElement | null;
    return !!e && (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.tagName === 'SELECT' || e.isContentEditable);
  };
  document.addEventListener('keydown', (e) => {
    if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    if (panel.hidden || !(o.canToggle?.() ?? true)) return;
    e.preventDefault();
    toggle();
  });

  return {
    toggle,
    isShown: () => shown,
    setVisible: (v) => { panel.hidden = !v; },
  };
}
