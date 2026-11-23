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
