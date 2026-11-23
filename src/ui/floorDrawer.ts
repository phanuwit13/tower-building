import type { FloorUiState } from '../app/controller';
import type { FloorGroup } from '../floors/types';
import { button, el } from './dom';
import { focusForKeyboard } from './focus';
import { ICONS, lineIcon } from './icons';
import { T } from './strings';

/** One tile in the drawer: its Thai name and a thumbnail (null: the name alone). */
export interface FloorSwatch { id: string; name: string; thumb: string | null }
export interface FloorDrawerView {
  open: boolean;
  /** The group whose tiles are shown. */
  group: FloorGroup;
  pick: FloorUiState['pick'];
  tool: FloorUiState['tool'];
  /** The shown group's tiles, in drawer order. */
  tiles: readonly FloorSwatch[];
}
export interface FloorDrawerHandlers {
  onPick(id: string): void;
  onEraser(): void;
  onTool(t: FloorUiState['tool']): void;
  onGroup(g: FloorGroup): void;
  onDone(): void;
}

/** Pure: the drawer's groups in order, each with its tiles in catalogue order; a group with no tiles is left out. */
export function drawerGroups<Tile extends { group: FloorGroup }>(
  groups: readonly { id: FloorGroup; name: string }[], tiles: readonly Tile[],
): { id: FloorGroup; name: string; tiles: Tile[] }[] {
  return groups
    .map((g) => ({ id: g.id, name: g.name, tiles: tiles.filter((t) => t.group === g.id) }))
    .filter((g) => g.tiles.length > 0);
}

const setPressed = (b: HTMLElement, on: boolean): void => {
  const v = String(on);
  if (b.getAttribute('aria-pressed') !== v) b.setAttribute('aria-pressed', v);
};

const sameTiles = (a: readonly FloorSwatch[], b: readonly FloorSwatch[]): boolean =>
  a.length === b.length && a.every((t, i) => t.id === b[i].id && t.name === b[i].name && t.thumb === b[i].thumb);

/** A tool button: its line icon, then its name. */
const toolButton = (paths: readonly string[], text: string, onClick: () => void): HTMLButtonElement =>
  el('button', { class: 'floor-tool', attrs: { type: 'button' }, onClick }, [lineIcon(paths), el('span', { text })]);

/**
 * The floor drawer: a see-through bar floating over the bottom of the map. The group tabs on top; under
 * them the 🖌 ปูกระเบื้อง / ✋ ขยับกล้อง tool toggle, a sideways-scrolling strip of tile swatches, and
 * [ยางลบ] [เสร็จ]. The strip keeps room for the biggest group (`tiles` on a group), so the bar keeps
 * its width from group to group. It only shows the view it is given; every choice goes to a handler.
 * The app re-renders it on every state change, so the swatches are rebuilt only when the shown tiles
 * change and attributes are written only when they change.
 */
export function createFloorDrawer(
  root: HTMLElement, groups: readonly { id: FloorGroup; name: string; tiles?: readonly unknown[] }[], h: FloorDrawerHandlers,
): { update(v: FloorDrawerView): void } {
  const tabs = new Map<FloorGroup, HTMLButtonElement>();
  for (const g of groups) tabs.set(g.id, button(g.name, () => h.onGroup(g.id), 'floor-tab'));
  const eraser = button(T.floor.eraser, h.onEraser, 'floor-eraser');
  const done = button(T.floor.done, h.onDone, 'floor-done');
  const paint = toolButton(ICONS.brush, T.floor.paint, () => h.onTool('paint'));
  const camera = toolButton(ICONS.hand, T.floor.camera, () => h.onTool('camera'));
  const strip = el('div', { class: 'floor-swatches' });
  const slots = Math.max(0, ...groups.map((g) => g.tiles?.length ?? 0));
  if (slots > 0) strip.style.setProperty('--slots', String(slots));
  const box = el('section', { class: 'floor-drawer', attrs: { 'aria-label': T.floor.title } }, [
    el('div', { class: 'floor-drawer-head' }, [
      el('div', { class: 'floor-groups', attrs: { role: 'group', 'aria-label': T.floor.groups } }, [...tabs.values()]),
    ]),
    el('div', { class: 'floor-drawer-body' }, [
      el('div', { class: 'floor-tools', attrs: { role: 'group', 'aria-label': T.floor.tools } }, [paint, camera]),
      strip,
      el('div', { class: 'floor-drawer-actions' }, [eraser, done]),
    ]),
  ]);
  box.hidden = true;
  root.appendChild(box);

  let shown: readonly FloorSwatch[] = [];
  let swatches: { id: string; btn: HTMLButtonElement }[] = [];
  const swatch = (t: FloorSwatch): HTMLButtonElement =>
    el('button', { class: 'floor-swatch', attrs: { type: 'button' }, onClick: () => h.onPick(t.id) }, [
      t.thumb ? el('img', { attrs: { src: t.thumb, alt: '', draggable: 'false' } }) : null,
      el('span', { text: t.name }),
    ]);

  return {
    update(v) {
      const opening = box.hidden && v.open;
      box.hidden = !v.open;
      if (!v.open) return;
      if (!sameTiles(shown, v.tiles)) {
        shown = v.tiles;
        swatches = v.tiles.map((t) => ({ id: t.id, btn: swatch(t) }));
        strip.replaceChildren(...swatches.map((s) => s.btn));
        strip.scrollLeft = 0;
      }
      for (const [id, b] of tabs) setPressed(b, id === v.group);
      for (const s of swatches) setPressed(s.btn, s.id === v.pick);
      setPressed(eraser, v.pick === 'eraser');
      setPressed(paint, v.tool === 'paint');
      setPressed(camera, v.tool === 'camera');
      if (opening && !box.contains(document.activeElement)) {
        // Keyboard users land on what is picked; the [ปูกระเบื้อง] button that had the focus is now hidden.
        focusForKeyboard(swatches.find((s) => s.id === v.pick)?.btn ?? (v.pick === 'eraser' ? eraser : done));
      }
    },
  };
}
