import { button, el } from './dom';
import { T } from './strings';

export function confirmDialog(root: HTMLElement, o: { message: string; confirmLabel: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const finish = (v: boolean): void => { overlay.remove(); resolve(v); };
    const ok = button(o.confirmLabel, () => finish(true), 'btn-confirm');
    const cancel = button(T.cancel, () => finish(false), 'btn-cancel');
    const dialog = el('div', { class: 'dialog', attrs: { role: 'dialog', 'aria-modal': 'true' } }, [
      el('p', { text: o.message }),
      el('div', { class: 'dialog-actions' }, [cancel, ok]),
    ]);
    const overlay = el('div', { class: 'overlay screen' }, [dialog]);
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    root.appendChild(overlay);
    ok.focus();
  });
}
