import { button, el } from './dom';
import { placedLabel, T } from './strings';

export interface ItemCard { name: string; size: string; thumb: string | null }
export interface HudView {
  visible: boolean; current: ItemCard | null; next: ItemCard | null;
  placed: number; canPlace: boolean; canRotate: boolean; hint: string | null;
  /** Round over and the end screen dismissed: restart replaces rotate/place. */
  finished: boolean;
}
export interface HudHandlers { onRotate(): void; onPlace(): void; onSettings(): void; onScreenshot(): void; onRestart(): void }

function cardView(label: string, cls: string, testId?: string) {
  const thumb = el('img', { class: 'card-thumb', attrs: { alt: '' } });
  const name = el('div', { class: 'card-name', attrs: testId ? { 'data-testid': testId } : {} });
  const size = el('div', { class: 'card-size' });
  const box = el('div', { class: `card ${cls}` }, [el('div', { class: 'card-label', text: label }), thumb, name, size]);
  // The HUD re-renders on every ghost move: only touch the DOM for what changed.
  let lastName: string | null = null;
  let lastSize: string | null = null;
  let lastThumb: string | null | undefined;
  return {
    box,
    set(c: ItemCard | null) {
      box.hidden = !c;
      if (!c) return;
      if (c.name !== lastName) { lastName = c.name; name.textContent = c.name; }
      if (c.size !== lastSize) { lastSize = c.size; size.textContent = c.size; }
      if (c.thumb !== lastThumb) {
        lastThumb = c.thumb;
        if (c.thumb) { thumb.setAttribute('src', c.thumb); thumb.hidden = false; } else { thumb.removeAttribute('src'); thumb.hidden = true; }
      }
    },
  };
}

export function createHud(root: HTMLElement, h: HudHandlers): { update(v: HudView): void } {
  const cur = cardView(T.current, 'card-current', 'current-name');
  const nxt = cardView(T.next, 'card-next');
  const placed = el('div', { class: 'hud-placed' });
  const hint = el('div', { class: 'hud-hint', attrs: { role: 'status' } });
  const rotate = button(T.rotate, h.onRotate, 'btn-rotate');
  const place = button(T.place, h.onPlace, 'btn-place');
  const restart = button(T.restart, h.onRestart, 'btn-restart');
  restart.hidden = true;
  const hud = el('div', { class: 'hud' }, [
    el('div', { class: 'hud-top' }, [
      el('div', { class: 'hud-cards' }, [cur.box, nxt.box]),
      placed,
      el('div', { class: 'hud-tools' }, [button(T.screenshot, h.onScreenshot), button(T.settings, h.onSettings)]),
    ]),
    hint,
    el('div', { class: 'hud-actions' }, [rotate, place, restart]),
  ]);
  hud.hidden = true;
  root.appendChild(hud);
  return {
    update(v) {
      hud.hidden = !v.visible;
      cur.set(v.current);
      nxt.set(v.next);
      const placedText = placedLabel(v.placed);
      if (placed.textContent !== placedText) placed.textContent = placedText;
      rotate.hidden = v.finished;
      place.hidden = v.finished;
      restart.hidden = !v.finished;
      rotate.disabled = !v.canRotate;
      place.disabled = !v.canPlace;
      const hintText = v.hint ?? '';
      if (hint.textContent !== hintText) hint.textContent = hintText;
      hint.hidden = !v.hint;
    },
  };
}
