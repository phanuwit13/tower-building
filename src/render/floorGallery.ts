import * as THREE from 'three';
import { FLOOR_GROUPS, FLOOR_TILES } from '../floors';
import { MAX_TILE_TRIANGLES } from '../floors/validate';
import type { FloorTile } from '../floors/types';
import type { StyleKit } from '../models/kit';
import { button, el } from '../ui/dom';
import { cellVariant } from './floors';
import { countTriangles } from './gallery';
import type { Stage } from './stage';

/** A tile shown as a PATCH x PATCH block of one tile, so its pattern and its seams are visible; (x, z) is the min-corner cell. */
export interface FloorSlot { tile: FloorTile; x: number; z: number }

const PATCH = 3;
const GAP_X = 2; // empty cells between patches in a row (labels are ~130 px wide)
const GAP_Z = 3; // between rows: the labels sit here
const PER_ROW = 3;
const ROWS_PER_PAGE = 2;

/** Pure: lay tiles out in patches, `PER_ROW` to a row and `ROWS_PER_PAGE` rows to a page, from cell (0, 0); the camera frames each page. */
export function floorGalleryPages(tiles: readonly FloorTile[]): FloorSlot[][] {
  const pages: FloorSlot[][] = [];
  const perPage = PER_ROW * ROWS_PER_PAGE;
  for (let start = 0; start < tiles.length; start += perPage) {
    pages.push(tiles.slice(start, start + perPage).map((tile, i) => ({
      tile,
      x: (i % PER_ROW) * (PATCH + GAP_X),
      z: Math.floor(i / PER_ROW) * (PATCH + GAP_Z),
    })));
  }
  return pages;
}

/**
 * `?gallery=floors`: every floor tile as a 3 x 3 patch with its Thai name, group and triangle
 * count under it, page by page. A review tool for sculptors; day/night comes from the settings panel.
 */
export function attachFloorGallery(stage: Stage, kit: StyleKit, tiles: readonly FloorTile[] = FLOOR_TILES): { pageCount: number; showPage(i: number): void } {
  stage.controls.enablePan = true;
  stage.controls.minDistance = 2;
  const pages = floorGalleryPages(tiles);
  const viewDir = stage.camera.position.clone().sub(stage.controls.target).normalize();
  const root = new THREE.Group();
  root.name = 'floor-gallery';
  stage.scene.add(root);

  const labelLayer = el('div', { class: 'gallery-labels' });
  const pageText = el('span', { class: 'gallery-page' });
  const prev = button('◀', () => showPage(current - 1), 'gallery-prev');
  const next = button('▶', () => showPage(current + 1), 'gallery-next');
  prev.setAttribute('aria-label', 'หน้าก่อน');
  next.setAttribute('aria-label', 'หน้าถัดไป');
  const pager = el('div', { class: 'gallery-pager' }, [prev, pageText, next]);
  pager.hidden = pages.length < 2;
  document.body.append(labelLayer, el('div', { class: 'gallery-head' }, [el('h1', { text: `พื้น · ${tiles.length} แบบ` }), pager]));

  interface Shown { object: THREE.Object3D; bounds: THREE.Box3; label: HTMLElement }
  let shown: Shown[] = [];
  let current = 0;
  let pageBox = new THREE.Box3();
  const groupName = (id: string) => FLOOR_GROUPS.find((g) => g.id === id)?.name ?? id;

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
      const object = new THREE.Group();
      let tris = 0;
      for (let dz = 0; dz < PATCH; dz++) {
        for (let dx = 0; dx < PATCH; dx++) {
          const t = slot.tile.build(kit, cellVariant(slot.x + dx, slot.z + dz, slot.tile.variants)); // each cell its own look, as on the map
          t.position.set(slot.x + dx + 0.5, 0, slot.z + dz + 0.5);
          object.add(t);
          if (dx === 0 && dz === 0) tris = countTriangles(t);
        }
      }
      object.traverse((o) => { if (o instanceof THREE.Mesh) o.receiveShadow = true; });
      root.add(object);
      const bounds = new THREE.Box3().setFromObject(object);
      box.union(bounds);
      box.expandByPoint(new THREE.Vector3(slot.x, 0, slot.z + PATCH + 2));
      const label = el('div', { class: 'gallery-label' }, [
        el('strong', { text: slot.tile.name }),
        el('span', { text: `${groupName(slot.tile.group)} · ${slot.tile.id}` }),
        el('span', { class: 'gallery-tris', text: `${tris} / ${MAX_TILE_TRIANGLES} tris` }),
      ]);
      labelLayer.appendChild(label);
      return { object, bounds, label };
    });
    pageText.textContent = `หน้า ${current + 1}/${pages.length}`;
    prev.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    pageBox = box;
    stage.invalidateShadows();
    frame(box);
  }

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

  // Labels sit just under the front edge of their patch.
  const p = new THREE.Vector3();
  stage.onFrame(() => {
    const rect = stage.canvas.getBoundingClientRect();
    for (const s of shown) {
      const { min, max } = s.bounds;
      let bottom = -Infinity;
      let visible = true;
      for (const x of [min.x, max.x]) for (const z of [min.z, max.z]) {
        p.set(x, 0, z).project(stage.camera);
        if (p.z > 1) visible = false;
        bottom = Math.max(bottom, ((1 - p.y) / 2) * rect.height);
      }
      p.set((min.x + max.x) / 2, 0, (min.z + max.z) / 2).project(stage.camera);
      const left = rect.left + ((p.x + 1) / 2) * rect.width;
      s.label.hidden = !visible;
      s.label.style.transform = `translate(${left.toFixed(1)}px, ${(rect.top + bottom + 4).toFixed(1)}px) translateX(-50%)`;
    }
  });

  let lastSize = '';
  new ResizeObserver(() => {
    const size = `${stage.canvas.clientWidth}x${stage.canvas.clientHeight}`;
    if (lastSize !== '' && size !== lastSize && shown.length > 0) frame(pageBox);
    lastSize = size;
  }).observe(stage.canvas);

  showPage(0);
  return { pageCount: pages.length, showPage };
}
