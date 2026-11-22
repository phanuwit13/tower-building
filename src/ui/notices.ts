import { el } from './dom';

export function showNotice(root: HTMLElement, text: string, ms = 4000): void {
  let stack = root.querySelector<HTMLElement>(':scope > .notices');
  if (!stack) {
    stack = el('div', { class: 'notices', attrs: { role: 'status', 'aria-live': 'polite' } });
    root.appendChild(stack);
  }
  const note = el('div', { class: 'notice', text });
  stack.appendChild(note);
  setTimeout(() => note.remove(), ms);
}
