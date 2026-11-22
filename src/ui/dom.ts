export interface ElOpts {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  onClick?: () => void;
}

/** Tiny DOM builder. Text always goes through textContent. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {},
  children: readonly (Node | null)[] = [],
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (opts.class) e.className = opts.class;
  if (opts.text !== undefined) e.textContent = opts.text;
  for (const [k, v] of Object.entries(opts.attrs ?? {})) e.setAttribute(k, v);
  if (opts.onClick) e.addEventListener('click', opts.onClick);
  for (const c of children) if (c) e.appendChild(c);
  return e;
}

export function button(text: string, onClick: () => void, cls = ''): HTMLButtonElement {
  return el('button', { text, onClick, class: cls, attrs: { type: 'button' } });
}
