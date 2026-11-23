import type { FloorUiState } from '../app/controller';
import type { FloorGroup } from '../floors/types';
import { button, el } from './dom';
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

/**
 * The floor drawer: a bottom sheet with the group tabs, [ยางลบ] [เสร็จ], the 🖌 ปูพื้น / ✋ ขยับกล้อง
 * tool toggle and a sideways-scrolling strip of tile swatches. It only shows the view it is given;
 * every choice goes to a handler. The app re-renders it on every state change, so the swatches are
 * rebuilt only when the shown tiles change and attributes are written only when they change.
 */
export function createFloorDrawer(
  root: HTMLElement, groups: readonly { id: FloorGroup; name: string }[], h: FloorDrawerHandlers,
): { update(v: FloorDrawerView): void } {
  const tabs = new Map<FloorGroup, HTMLButtonElement>();
  for (const g of groups) tabs.set(g.id, button(g.name, () => h.onGroup(g.id), 'chip floor-tab'));
  const eraser = button(T.floor.eraser, h.onEraser, 'floor-eraser');
  const done = button(T.floor.done, h.onDone, 'floor-done');
  const paint = button(T.floor.paint, () => h.onTool('paint'), 'floor-tool');
  const camera = button(T.floor.camera, () => h.onTool('camera'), 'floor-tool');
  const strip = el('div', { class: 'floor-swatches' });
  const box = el('section', { class: 'floor-drawer', attrs: { 'aria-label': T.floor.title } }, [
    el('div', { class: 'floor-drawer-head' }, [
      el('div', { class: 'floor-groups', attrs: { role: 'group', 'aria-label': T.floor.groups } }, [...tabs.values()]),
      el('div', { class: 'floor-drawer-actions' }, [eraser, done]),
    ]),
    el('div', { class: 'floor-drawer-body' }, [
      el('div', { class: 'floor-tools', attrs: { role: 'group', 'aria-label': T.floor.tools } }, [paint, camera]),
      strip,
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
        // Keyboard users land on what is picked; the [พื้น] button that had the focus is now hidden.
        (swatches.find((s) => s.id === v.pick)?.btn ?? (v.pick === 'eraser' ? eraser : done)).focus();
      }
    },
  };
}
