import * as THREE from 'three';
import { GRID_SIZE } from '../game/types';
import type { ItemModel } from '../models/contract';
import type { StyleKit } from '../models/kit';
import type { ThemeDef } from '../themes/types';
import { button, el } from '../ui/dom';
import { sizeLabel } from '../ui/strings';
import { placementTransform } from './city';
import type { Stage } from './stage';
import { createThumbnailer } from './thumbnails';

/** An item shown in the gallery at rotation 0; (x, z) is its min-corner tile, as in a placement. */
export interface GallerySlot { item: ItemModel; x: number; z: number }

const GAP = 1; // empty tiles between items in a row
const ROW_GAP = 2; // empty tiles between rows: the labels (thumbnail + text) sit here
const BIG = 4; // footprint area from which an item goes in the back rows

/**
 * Pure: lay a theme's items out on the map, page by page. Big footprints fill the back rows and
 * small ones the front rows (so nothing tall hides a small item from the default camera); each
 * row is centred, items in a row share a front edge, and a page holds as many rows as fit.
 */
export function galleryPages(items: readonly ItemModel[], size = GRID_SIZE): GallerySlot[][] {
  const rows: ItemModel[][] = [];
  for (const band of [items.filter((i) => i.footprint.w * i.footprint.d >= BIG), items.filter((i) => i.footprint.w * i.footprint.d < BIG)]) {
    let row: ItemModel[] = [];
    let width = 0;
    for (const it of band) {
      if (row.length > 0 && width + GAP + it.footprint.w > size) {
        rows.push(row);
        row = [];
      }
      width = row.length > 0 ? width + GAP + it.footprint.w : it.footprint.w;
      row.push(it);
    }
    if (row.length > 0) rows.push(row);
  }

  const pages: GallerySlot[][] = [];
  let page: GallerySlot[] = [];
  let z = 0;
  const finish = () => {
    const used = z - ROW_GAP;
    const shift = Math.floor((size - used) / 2);
    for (const s of page) s.z += shift;
    pages.push(page);
  };
  for (const row of rows) {
    const depth = Math.max(...row.map((i) => i.footprint.d));
    if (page.length > 0 && z + depth > size) {
      finish();
      page = [];
      z = 0;
    }
    const width = row.reduce((sum, i) => sum + i.footprint.w, 0) + GAP * (row.length - 1);
    let x = Math.floor((size - width) / 2);
    for (const it of row) {
      page.push({ item: it, x, z: z + depth - it.footprint.d });
      x += it.footprint.w + GAP;
    }
    z += depth + ROW_GAP;
  }
  if (page.length > 0) finish();
  return pages;
}

/** Pure: the triangle budget of a footprint; the same formula validateItemModel enforces. */
export function triangleBudget(fp: { w: number; d: number }): number {
  return 800 + 400 * fp.w * fp.d;
}

/** Pure: triangles in every mesh under an object, as validateItemModel counts them. */
export function countTriangles(obj: THREE.Object3D): number {
  let n = 0;
  obj.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const g = (o as THREE.Mesh).geometry;
    n += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
  });
  return n;
}

/** Pure: the "used / budget" label text, e.g. `612 / 2,400` (fixed locale so it reads the same everywhere). */
export function budgetLabel(used: number, fp: { w: number; d: number }): string {
  return `${used.toLocaleString('en-US')} / ${triangleBudget(fp).toLocaleString('en-US')}`;
}

/** Pure: the item with this id, for `&item=<id>`; undefined when there is none. */
export function selectItem(items: readonly ItemModel[], id: string | null): ItemModel | undefined {
  return id === null ? undefined : items.find((i) => i.id === id);
}

/**
 * `?gallery=<themeId>`: every item of a theme laid out on the map with a Thai label under it, the
 * camera framing them, page by page. A review tool for the owner and for sculpting new items.
 */
export function attachGallery(
  stage: Stage, kit: StyleKit, theme: ThemeDef, opts: { itemId?: string | null } = {},
): { pageCount: number; showPage(i: number): void } {
  // Gallery-only camera: panning and close-ups (game mode keeps the stage's own limits).
  stage.controls.enablePan = true;
  stage.controls.minDistance = 2;
  const only = selectItem(theme.items, opts.itemId ?? null);
  const unknownItem = opts.itemId != null && !only;
  if (unknownItem) console.warn(`gallery: unknown item id "${opts.itemId}", showing every item`);
  const pages = only
    ? [[{ item: only, x: Math.floor((GRID_SIZE - only.footprint.w) / 2), z: Math.floor((GRID_SIZE - only.footprint.d) / 2) }]]
    : galleryPages(theme.items);
  const thumbs = createThumbnailer(kit);
  // The stage's starting camera direction: items are reviewed the way kids first see them.
  const viewDir = stage.camera.position.clone().sub(stage.controls.target).normalize();
  const root = new THREE.Group();
  root.name = 'gallery';
  stage.scene.add(root);

  const labelLayer = el('div', { class: 'gallery-labels' });
  const pageText = el('span', { class: 'gallery-page' });
  const prev = button('◀', () => showPage(current - 1), 'gallery-prev');
  const next = button('▶', () => showPage(current + 1), 'gallery-next');
  prev.setAttribute('aria-label', 'หน้าก่อน');
  next.setAttribute('aria-label', 'หน้าถัดไป');
  const pager = el('div', { class: 'gallery-pager' }, [prev, pageText, next]);
  pager.hidden = pages.length < 2;
  const head = el('div', { class: 'gallery-head' }, [
    el('h1', { text: `${theme.emoji} ${theme.name} · ${theme.items.length} ชิ้น` }),
    pager,
  ]);
  document.body.append(labelLayer, head);
  if (unknownItem) head.append(el('small', { class: 'gallery-note', text: `unknown item id: ${opts.itemId}` }));

  interface Shown { object: THREE.Object3D; bounds: THREE.Box3; label: HTMLElement }
  let shown: Shown[] = [];
  let current = 0;
  let pageBox = new THREE.Box3();

  function showPage(i: number): void {
    if (pages.length === 0) return;
    current = Math.max(0, Math.min(pages.length - 1, i));
    for (const s of shown) {
      root.remove(s.object);
      s.object.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); // kit materials are shared
      s.label.remove();
    }
    const box = new THREE.Box3();
    shown = pages[current].map((slot) => {
      const object = slot.item.build(kit);
      const t = placementTransform(slot.item.footprint, slot.x, slot.z, 0);
      object.position.set(t.x, t.y, t.z);
      root.add(object);
      const bounds = new THREE.Box3().setFromObject(object);
      box.union(bounds);
      const { w, d } = slot.item.footprint;
      // the footprint and a strip in front of it, where the label goes
      box.expandByPoint(new THREE.Vector3(slot.x, 0, slot.z)).expandByPoint(new THREE.Vector3(slot.x + w + 0.5, 0, slot.z + d + 1.5));
      const thumb = el('img', { class: 'gallery-thumb' });
      thumb.alt = '';
      const url = thumbs.get(slot.item);
      if (url) thumb.src = url;
      else thumb.hidden = true;
      const label = el('div', { class: 'gallery-label' }, [
        thumb,
        el('strong', { text: slot.item.name }),
        el('span', { text: `${sizeLabel(slot.item.footprint)} · ${slot.item.id}` }),
        el('span', { class: 'gallery-tris', text: `${budgetLabel(countTriangles(object), slot.item.footprint)} tris` }),
      ]);
      labelLayer.appendChild(label);
      return { object, bounds, label };
    });
    pageText.textContent = `หน้า ${current + 1}/${pages.length}`;
    prev.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    pageBox = box;
    frame(box);
  }

  /** Point the camera along the default view direction, at a distance that fits the page. */
  function frame(box: THREE.Box3): void {
    const { camera, controls } = stage;
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = Math.min(controls.maxDistance, Math.max(controls.minDistance, (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 0.95));
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(viewDir, dist);
    controls.update();
  }

  // Labels follow their item on screen, centred just under the lowest point of its model.
  const p = new THREE.Vector3();
  stage.onFrame(() => {
    const rect = stage.canvas.getBoundingClientRect();
    for (const s of shown) {
      const { min, max } = s.bounds;
      let bottom = -Infinity;
      let visible = true;
      for (const x of [min.x, max.x]) {
        for (const y of [min.y, max.y]) {
          for (const z of [min.z, max.z]) {
            p.set(x, y, z).project(stage.camera);
            if (p.z > 1) visible = false;
            bottom = Math.max(bottom, ((1 - p.y) / 2) * rect.height);
          }
        }
      }
      p.set((min.x + max.x) / 2, 0, (min.z + max.z) / 2).project(stage.camera);
      const left = rect.left + ((p.x + 1) / 2) * rect.width;
      s.label.hidden = !visible;
      s.label.style.transform = `translate(${left.toFixed(1)}px, ${(rect.top + bottom + 4).toFixed(1)}px) translateX(-50%)`;
    }
  });

  // Re-frame the page when the window changes size (the stage updates the camera aspect first).
  let lastSize = '';
  new ResizeObserver(() => {
    const size = `${stage.canvas.clientWidth}x${stage.canvas.clientHeight}`;
    if (lastSize !== '' && size !== lastSize && shown.length > 0) frame(pageBox);
    lastSize = size;
  }).observe(stage.canvas);

  showPage(0);
  return { pageCount: pages.length, showPage };
}
