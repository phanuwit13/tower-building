import { button, el } from './dom';
import { focusReturn } from './focus';
import { NEXT_COUNT } from '../app/controller';
import { placedLabel, T } from './strings';

export interface ItemCard { name: string; size: string; thumb: string | null }
export interface HudView {
  visible: boolean; current: ItemCard | null;
  /** The items after the current one, in order (up to four; none once the round is finished). */
  next: readonly ItemCard[];
  placed: number; canPlace: boolean; canRotate: boolean; hint: string | null;
  /** Round over and the end screen dismissed: restart replaces rotate/place. */
  finished: boolean;
  /** The floor drawer is open: the item cards, the hint and the bottom row ([พื้น], หมุน/วาง) step aside. */
  floorMode: boolean;
}
export interface HudHandlers {
  onRotate(): void; onPlace(): void; onRestart(): void;
  /** [พื้น]: open the floor drawer (while playing, and once the round is finished). */
  onFloors(): void;
  /** 🏠 เปลี่ยนธีม: back to theme select (always there: playing, finished, floor drawer open). */
  onHome(): void;
}

/** A brush over a 2 x 2 tile grid: "paint tiles", not "change the whole ground". */
function brushTileIcon(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'floor-icon');
  const add = (tag: string, attrs: Record<string, string>): void => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
  };
  for (const [x, y] of [[2, 2], [12, 2], [2, 12], [12, 12]]) add('rect', { x: String(x), y: String(y), width: '9', height: '9', rx: '2' });
  add('path', { d: 'M9 20 L20 9', class: 'brush' });
  return svg;
}

/**
 * Pure: the "tap the ground" hint, while playing with no spot picked yet. It teaches the first
 * placement, so once any item has ever been placed in this browser (`placedEver`) it never shows again.
 */
export function tapHint(v: { playing: boolean; ghost: boolean; placedEver: boolean }): string | null {
  return v.playing && !v.ghost && !v.placedEver ? T.hintTap : null;
}

function cardView(label: string | null, cls: string, testId?: string) {
  const thumb = el('img', { class: 'card-thumb', attrs: { alt: '' } });
  const name = el('div', { class: 'card-name', attrs: testId ? { 'data-testid': testId } : {} });
  const size = el('div', { class: 'card-size' });
  const box = el('div', { class: `card ${cls}` }, [label ? el('div', { class: 'card-label', text: label }) : null, thumb, name, size]);
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
  // The next items: small cards under one "ชิ้นถัดไป" label (a narrow screen keeps the first two).
  const minis = Array.from({ length: NEXT_COUNT }, () => cardView(null, 'card-mini'));
  const nextBox = el('div', { class: 'card card-next' }, [
    el('div', { class: 'card-label', text: T.next }),
    el('div', { class: 'next-row' }, minis.map((m) => m.box)),
  ]);
  const placed = el('div', { class: 'hud-placed' });
  const hint = el('div', { class: 'hud-hint', attrs: { role: 'status' } });
  const rotate = button(T.rotate, h.onRotate, 'btn-rotate');
  const place = button(T.place, h.onPlace, 'btn-place');
  const restart = button(T.restart, h.onRestart, 'btn-restart');
  restart.hidden = true;
  const floors = el('button', { class: 'btn-floors', attrs: { type: 'button' }, onClick: h.onFloors }, [
    brushTileIcon(), el('span', { text: T.floor.open }),
  ]);
  const cards = el('div', { class: 'hud-cards' }, [cur.box, nextBox]);
  const bottom = el('div', { class: 'hud-bottom' }, [floors, el('div', { class: 'hud-actions' }, [rotate, place, restart])]);
  const hud = el('div', { class: 'hud' }, [
    el('div', { class: 'hud-top' }, [
      // 🏠 above the item cards, not beside them: a tablet held upright (768 px) has no room for both in one row
      el('div', { class: 'hud-left' }, [button(T.home, h.onHome, 'btn-home'), cards]),
      placed,
    ]),
    hint,
    bottom,
  ]);
  hud.hidden = true;
  root.appendChild(hud);
  let floorMode = false;
  let restoreFloors: () => void = () => {};
  return {
    update(v) {
      hud.hidden = !v.visible;
      cards.hidden = v.floorMode;
      bottom.hidden = v.floorMode;
      if (!floorMode && v.floorMode) restoreFloors = focusReturn(floors); // opened by keyboard or by mouse?
      if (floorMode && !v.floorMode) {
        // The drawer took the focus with it (nowhere, or a button now hidden): give it back to [พื้น].
        const a = document.activeElement;
        if (!a || a === document.body || a.closest('[hidden]')) restoreFloors();
      }
      floorMode = v.floorMode;
      cur.set(v.current);
      nextBox.hidden = v.next.length === 0;
      minis.forEach((m, i) => m.set(v.next[i] ?? null));
      const placedText = placedLabel(v.placed);
      if (placed.textContent !== placedText) placed.textContent = placedText;
      rotate.hidden = v.finished;
      place.hidden = v.finished;
      restart.hidden = !v.finished;
      rotate.disabled = !v.canRotate;
      place.disabled = !v.canPlace;
      const hintText = v.hint ?? '';
      if (hint.textContent !== hintText) hint.textContent = hintText;
      hint.hidden = !v.hint || v.floorMode;
    },
  };
}
