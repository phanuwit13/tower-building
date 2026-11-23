/**
 * Keyboard focus after a mouse or finger. A button (or the zoom slider) that keeps the focus after a
 * click would take the next Space or Enter itself and the game would never see it; so a pointer
 * gesture hands the focus back to the page, and focus is only moved by code for keyboard users.
 */
let pointerLast = false;

/** True when the last input was a key (the default): code may then move the focus for the player. */
export const keyboardActive = (): boolean => !pointerLast;

/** Move the focus to `el` for a keyboard user; after a mouse/touch press it stays on the page. */
export function focusForKeyboard(el: HTMLElement | null | undefined): void {
  if (el && el.isConnected && keyboardActive()) el.focus();
}

/**
 * For something that opens now (a popover, a panel, a drawer, a dialog) and closes later, maybe by Esc:
 * remembers whether the keyboard opened it, and gives back a function that returns the focus to `el`
 * only then. A mouse-opened popover closed with Esc leaves the focus on the page, so Space still places.
 */
export function focusReturn(el: HTMLElement | null | undefined): () => void {
  const viaKeyboard = keyboardActive();
  return () => { if (viaKeyboard && el && el.isConnected) el.focus(); };
}

/** A simple Tab trap: Tab and Shift+Tab cycle through the buttons and fields inside `box` while it is open. */
export function trapTab(e: KeyboardEvent, box: HTMLElement): void {
  if (e.key !== 'Tab') return;
  const items = [...box.querySelectorAll<HTMLElement>('button, input, [tabindex]')].filter((n) => !(n as HTMLButtonElement).disabled && !n.closest('[hidden]'));
  if (items.length === 0) { e.preventDefault(); return; }
  const first = items[0];
  const last = items[items.length - 1];
  const inside = box.contains(document.activeElement);
  if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
}

const isButtonLike = (e: Element | null): e is HTMLElement =>
  !!e && (e.tagName === 'BUTTON' || (e.tagName === 'INPUT' && (e as HTMLInputElement).type === 'range'));

/** Install once: tracks the input modality and blurs a button/slider the pointer just used. */
export function installPointerFocusReturn(doc: Document = document): () => void {
  const onKey = (): void => { pointerLast = false; };
  const onPointer = (): void => { pointerLast = true; };
  const blurIfUsed = (e: Event): void => {
    const target = e.target instanceof Element ? e.target : null;
    const used = target?.closest('button, input[type="range"]') ?? null;
    const active = doc.activeElement;
    if (used && active === used && isButtonLike(used)) used.blur();
  };
  // A keyboard-made click has detail 0; a mouse or touch click has 1 or more.
  const onClick = (e: MouseEvent): void => { if (e.detail > 0) blurIfUsed(e); };
  const onRangeDone = (e: Event): void => { if (pointerLast) blurIfUsed(e); };
  doc.addEventListener('keydown', onKey, true);
  doc.addEventListener('pointerdown', onPointer, true);
  doc.addEventListener('click', onClick);
  doc.addEventListener('pointerup', onRangeDone);
  doc.addEventListener('change', onRangeDone);
  return () => {
    doc.removeEventListener('keydown', onKey, true);
    doc.removeEventListener('pointerdown', onPointer, true);
    doc.removeEventListener('click', onClick);
    doc.removeEventListener('pointerup', onRangeDone);
    doc.removeEventListener('change', onRangeDone);
  };
}
