// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { FloorGroup } from '../floors/types';
import { createFloorDrawer, drawerGroups, type FloorDrawerView } from './floorDrawer';
import { T } from './strings';

const groups: readonly { id: FloorGroup; name: string }[] = [
  { id: 'wood', name: 'ไม้' },
  { id: 'stone', name: 'หิน-อิฐ' },
];
const woodTiles = [
  { id: 'wood-light', name: 'ไม้กระดานสีอ่อน', thumb: 'data:image/png;base64,AAAA' },
  { id: 'wood-dark', name: 'ไม้กระดานสีเข้ม', thumb: null },
];
const view = (o: Partial<FloorDrawerView> = {}): FloorDrawerView => ({
  open: true, group: 'wood', pick: 'wood-light', tool: 'paint', tiles: woodTiles, ...o,
});
function setup() {
  const root = document.createElement('div');
  document.body.appendChild(root);
  const h = { onPick: vi.fn(), onEraser: vi.fn(), onTool: vi.fn(), onGroup: vi.fn(), onDone: vi.fn() };
  const drawer = createFloorDrawer(root, groups, h);
  const box = root.querySelector('.floor-drawer') as HTMLElement;
  return { root, h, drawer, box };
}
const btn = (root: HTMLElement, name: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent === name) as HTMLButtonElement;
const swatches = (root: HTMLElement) => [...root.querySelectorAll<HTMLButtonElement>('.floor-swatch')];
const pressed = (b: HTMLElement) => b.getAttribute('aria-pressed') === 'true';

describe('drawerGroups', () => {
  it('keeps the group order, the tiles in catalogue order, and drops groups with no tiles', () => {
    const t = (id: string, group: FloorGroup) => ({ id, group });
    const all = [
      { id: 'wood', name: 'ไม้' }, { id: 'tile', name: 'ปูน-กระเบื้อง' }, { id: 'stone', name: 'หิน-อิฐ' },
    ] as const;
    const out = drawerGroups(all, [t('brick', 'stone'), t('oak', 'wood'), t('pine', 'wood')]);
    expect(out.map((g) => g.id)).toEqual(['wood', 'stone']);
    expect(out[0].name).toBe('ไม้');
    expect(out[0].tiles.map((x) => x.id)).toEqual(['oak', 'pine']);
    expect(out[1].tiles.map((x) => x.id)).toEqual(['brick']);
  });
});

describe('floor drawer', () => {
  it('is hidden until opened, and hides again when closed', () => {
    const { drawer, box } = setup();
    expect(box.hidden).toBe(true);
    drawer.update(view());
    expect(box.hidden).toBe(false);
    drawer.update(view({ open: false }));
    expect(box.hidden).toBe(true);
  });

  it('shows the group tabs, the eraser, done, both tools and the swatches of the shown group', () => {
    const { root, drawer } = setup();
    drawer.update(view());
    for (const name of ['ไม้', 'หิน-อิฐ', T.floor.eraser, T.floor.done, T.floor.paint, T.floor.camera]) {
      expect(btn(root, name), name).toBeTruthy();
    }
    expect(swatches(root).map((s) => s.textContent)).toEqual(['ไม้กระดานสีอ่อน', 'ไม้กระดานสีเข้ม']);
    const imgs = swatches(root).map((s) => s.querySelector('img'));
    expect(imgs[0]?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(imgs[1]).toBeNull(); // no thumbnail: the name alone
  });

  it('every button is a real button (type=button)', () => {
    const { root, drawer } = setup();
    drawer.update(view());
    for (const b of root.querySelectorAll('button')) expect(b.getAttribute('type')).toBe('button');
  });

  it('marks the shown group, the picked tile and the tool as pressed', () => {
    const { root, drawer } = setup();
    drawer.update(view());
    expect(pressed(btn(root, 'ไม้'))).toBe(true);
    expect(pressed(btn(root, 'หิน-อิฐ'))).toBe(false);
    expect(swatches(root).map(pressed)).toEqual([true, false]);
    expect(pressed(btn(root, T.floor.eraser))).toBe(false);
    expect(pressed(btn(root, T.floor.paint))).toBe(true);
    expect(pressed(btn(root, T.floor.camera))).toBe(false);

    drawer.update(view({ pick: 'eraser', tool: 'camera' }));
    expect(swatches(root).map(pressed)).toEqual([false, false]);
    expect(pressed(btn(root, T.floor.eraser))).toBe(true);
    expect(pressed(btn(root, T.floor.paint))).toBe(false);
    expect(pressed(btn(root, T.floor.camera))).toBe(true);
  });

  it('wires every button to its handler', () => {
    const { root, h, drawer } = setup();
    drawer.update(view());
    btn(root, 'หิน-อิฐ').click();
    swatches(root)[1].click();
    btn(root, T.floor.eraser).click();
    btn(root, T.floor.camera).click();
    btn(root, T.floor.paint).click();
    btn(root, T.floor.done).click();
    expect(h.onGroup).toHaveBeenCalledWith('stone');
    expect(h.onPick).toHaveBeenCalledWith('wood-dark');
    expect(h.onEraser).toHaveBeenCalledOnce();
    expect(h.onTool.mock.calls).toEqual([['camera'], ['paint']]);
    expect(h.onDone).toHaveBeenCalledOnce();
  });

  it('rebuilds the swatches only when the shown tiles change', () => {
    const { root, drawer } = setup();
    drawer.update(view());
    const first = swatches(root)[0];
    drawer.update(view({ tiles: woodTiles.map((t) => ({ ...t })), tool: 'camera' }));
    expect(swatches(root)[0]).toBe(first);
    drawer.update(view({ group: 'stone', pick: 'wood-light', tiles: [{ id: 'brick-red', name: 'อิฐแดง', thumb: null }] }));
    expect(swatches(root).map((s) => s.textContent)).toEqual(['อิฐแดง']);
    expect(pressed(btn(root, 'หิน-อิฐ'))).toBe(true);
    expect(swatches(root).map(pressed)).toEqual([false]); // the pick is in another group
  });

  it('opening moves the focus into the drawer (the picked swatch), unless it is already there', () => {
    const { root, drawer } = setup();
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    drawer.update(view({ pick: 'wood-dark' }));
    expect(document.activeElement).toBe(swatches(root)[1]);
    btn(root, T.floor.done).focus();
    drawer.update(view({ pick: 'wood-dark', tool: 'camera' }));
    expect(document.activeElement).toBe(btn(root, T.floor.done));
    opener.remove();
  });

  it('the tools show a line icon before their name (no emoji); the groups have the top row, [ยางลบ] [เสร็จ] sit beside the swatches', () => {
    const { root, drawer } = setup();
    drawer.update(view());
    for (const name of [T.floor.paint, T.floor.camera]) {
      const b = btn(root, name);
      expect(b.querySelector('svg.line-icon'), name).not.toBeNull();
      expect(b.textContent, name).not.toMatch(/\p{Extended_Pictographic}/u);
    }
    const head = root.querySelector('.floor-drawer-head')!;
    expect([...head.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['ไม้', 'หิน-อิฐ']);
    const body = root.querySelector('.floor-drawer-body')!;
    expect(body.contains(btn(root, T.floor.eraser))).toBe(true);
    expect(body.contains(btn(root, T.floor.done))).toBe(true);
  });

  it('keeps room for the biggest group\'s swatches, so the bar keeps its width from group to group', () => {
    const root = document.body.appendChild(document.createElement('div'));
    const h = { onPick: vi.fn(), onEraser: vi.fn(), onTool: vi.fn(), onGroup: vi.fn(), onDone: vi.fn() };
    createFloorDrawer(root, [{ id: 'wood', name: 'ไม้', tiles: [1, 2] }, { id: 'stone', name: 'หิน-อิฐ', tiles: [1, 2, 3, 4, 5] }], h);
    expect(root.querySelector<HTMLElement>('.floor-swatches')!.style.getPropertyValue('--slots')).toBe('5');
  });
});
