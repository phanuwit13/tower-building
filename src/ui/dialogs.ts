import { button, el } from './dom';
import { focusForKeyboard } from './focus';
import { T } from './strings';

export function confirmDialog(root: HTMLElement, o: { message: string; confirmLabel: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const finish = (v: boolean): void => { document.removeEventListener('keydown', onKey);
      overlay.remove();
      focusForKeyboard(prev);
      resolve(v); };
    const ok = button(o.confirmLabel, () => finish(true), 'btn-confirm');
    const cancel = button(T.cancel, () => finish(false), 'btn-cancel');
    const dialog = el('div', { class: 'dialog', attrs: { role: 'dialog', 'aria-modal': 'true' } }, [
      el('p', { text: o.message }),
      el('div', { class: 'dialog-actions' }, [cancel, ok]),
    ]);
    const overlay = el('div', { class: 'overlay screen' }, [dialog]);
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    };
    document.addEventListener('keydown', onKey);
    root.appendChild(overlay);
    ok.focus();
  });
}
