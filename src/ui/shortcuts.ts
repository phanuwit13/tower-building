import { button, el } from './dom';
import { focusForKeyboard, focusReturn, trapTab } from './focus';
import { T } from './strings';

/** True on a machine that most likely has a keyboard and a mouse: the ⌨️ button only shows there. */
export const hasFinePointer = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export interface ShortcutsOptions {
  /** `?` opens the panel only when this says the page is free of other overlays. */
  canOpen?: () => boolean;
  onOpenChange?(open: boolean): void;
}

/**
 * The ⌨️ panel: every key the game answers to. It owns the keyboard while open (`isOpen`), closes on
 * Esc, on ✕ and on a tap outside the card, and `?` opens (and closes) it from the keyboard.
 */
export function createShortcutsPanel(root: HTMLElement, o: ShortcutsOptions = {}): {
  open(): void; close(): void; toggle(): void; isOpen(): boolean;
} {
  const closeBtn = button(T.close, () => close(), 'btn-close');
  const list = el('ul', { class: 'shortcut-list' }, T.shortcuts.rows.map((r) =>
    el('li', {}, [
      el('span', { class: 'shortcut-keys' }, r.keys.map((k) => el('kbd', { text: k }))),
      el('span', { class: 'shortcut-does', text: r.does }),
    ])));
  const card = el('div', { class: 'shortcuts-card', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': T.shortcuts.title } }, [
    el('div', { class: 'settings-head' }, [el('h2', { text: T.shortcuts.title }), closeBtn]),
    list,
    el('p', { class: 'shortcut-note', text: T.shortcuts.note }),
  ]);
  const wrap = el('div', { class: 'shortcuts screen' }, [card]);
  wrap.hidden = true;
  root.appendChild(wrap);
  wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap) close(); });

  let restore: (() => void) | null = null;
  const isOpen = (): boolean => !wrap.hidden;
  const typing = (t: EventTarget | null): boolean => {
    const e = t as HTMLElement | null;
    return !!e && (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' || e.tagName === 'SELECT' || e.isContentEditable);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); return; }
    if (isOpen()) { trapTab(e, card); if (e.key === 'Tab') return; }
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e.target)) {
      if (isOpen()) { e.preventDefault(); close(); } else if (o.canOpen?.() ?? true) { e.preventDefault(); open(); }
    }
  };
  document.addEventListener('keydown', onKey);

  function open(): void {
    if (isOpen()) return;
    restore = focusReturn(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    wrap.hidden = false;
    focusForKeyboard(closeBtn);
    o.onOpenChange?.(true);
  }
  function close(): void {
    if (!isOpen()) return;
    wrap.hidden = true;
    const back = restore;
    restore = null;
    back?.();
    o.onOpenChange?.(false);
  }
  return { open, close, toggle: () => (isOpen() ? close() : open()), isOpen };
}
