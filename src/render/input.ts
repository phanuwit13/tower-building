import * as THREE from 'three';
import type { Controller } from '../app/controller';
import { rotatedFootprint } from '../game/grid';
import { GRID_SIZE, type Catalog } from '../game/types';
import { getCatalog } from '../themes/registry';
import type { Stage } from './stage';

export const TAP_MAX_MOVE_PX = 6;
export const TAP_MAX_MS = 400;

/** A release counts as a tap when it stays within 6 px and 400 ms of the press. */
export function isTap(dxPx: number, dyPx: number, dtMs: number): boolean {
  return Math.hypot(dxPx, dyPx) <= TAP_MAX_MOVE_PX && dtMs <= TAP_MAX_MS;
}

/** Intersect a ray with y = 0 and return the tile; null if it misses the plane or (unless clamped) the map. */
export function rayToTile(
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  clamp = false,
): { tx: number; tz: number } | null {
  if (dir.y >= -1e-6) return null;
  const t = -origin.y / dir.y;
  const px = origin.x + dir.x * t;
  const pz = origin.z + dir.z * t;
  let tx = Math.floor(px);
  let tz = Math.floor(pz);
  if (clamp) {
    tx = Math.min(Math.max(tx, 0), GRID_SIZE - 1);
    tz = Math.min(Math.max(tz, 0), GRID_SIZE - 1);
  } else if (tx < 0 || tz < 0 || tx >= GRID_SIZE || tz >= GRID_SIZE) {
    return null;
  }
  return { tx, tz };
}

export function attachInput(
  stage: Stage,
  c: Controller,
  catalogOf: (themeId: string) => Catalog | undefined = getCatalog,
): () => void {
  const { canvas, controls, camera } = stage;
  canvas.style.touchAction = 'none';

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (e: PointerEvent, clamp: boolean) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    return rayToTile(ray.ray.origin, ray.ray.direction, clamp);
  };

  const onGhost = (tx: number, tz: number): boolean => {
    const s = c.getState();
    if (!s.ghost || !s.game || s.screen !== 'playing') return false;
    const spec = catalogOf(s.game.themeId)?.items[s.game.current];
    if (!spec) return false;
    const { w, d } = rotatedFootprint(spec.footprint, s.ghost.rotation);
    return tx >= s.ghost.x && tx < s.ghost.x + w && tz >= s.ghost.z && tz < s.ghost.z + d;
  };

  const pointers = new Set<number>();
  let press: { id: number; x: number; y: number; t: number; camPos: THREE.Vector3; target: THREE.Vector3 } | null = null;
  let dragging = false;
  let multi = false; // a second finger joined this gesture: never a tap, never a ghost drag

  const endDrag = () => {
    if (dragging) {
      dragging = false;
      controls.enabled = true;
    }
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.add(e.pointerId);
    if (pointers.size > 1) {
      multi = true;
      endDrag();
      press = null;
      return;
    }
    multi = false;
    press = {
      id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(),
      camPos: camera.position.clone(), target: controls.target.clone(),
    };
    const tile = pick(e, false);
    if (tile && onGhost(tile.tx, tile.tz)) {
      dragging = true;
      controls.enabled = false;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging || !press || e.pointerId !== press.id || multi) return;
    const tile = pick(e, true);
    if (tile) c.dragGhostTo(tile.tx, tile.tz);
  };

  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    const p = press;
    if (!p || e.pointerId !== p.id) {
      if (pointers.size === 0) { multi = false; endDrag(); }
      return;
    }
    press = null;
    const wasDragging = dragging;
    endDrag();
    if (multi) { if (pointers.size === 0) multi = false; return; }
    if (isTap(e.clientX - p.x, e.clientY - p.y, performance.now() - p.t)) {
      if (!wasDragging) {
        // Undo the few pixels of orbit the press may have caused.
        // Damping keeps a pending rotation; flush it with damping off, then restore the exact pose.
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = true;
        camera.position.copy(p.camPos);
        controls.target.copy(p.target);
        controls.update();
      }
      const tile = pick(e, false);
      if (tile) c.tapTile(tile.tx, tile.tz);
    }
  };

  const onCancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    press = null;
    if (pointers.size === 0) multi = false;
    endDrag();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    const tag = t?.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;
    switch (e.key) {
      case 'ArrowLeft': c.moveGhost(-1, 0); break;
      case 'ArrowRight': c.moveGhost(1, 0); break;
      case 'ArrowUp': c.moveGhost(0, -1); break;
      case 'ArrowDown': c.moveGhost(0, 1); break;
      case 'r': case 'R': c.rotateGhost(); break;
      case 'Enter': case ' ': c.place(); break;
      default: return;
    }
    e.preventDefault();
  };

  const cap = { capture: true } as const;
  canvas.addEventListener('pointerdown', onDown, cap);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  document.addEventListener('keydown', onKey);
  return () => {
    canvas.removeEventListener('pointerdown', onDown, cap);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onCancel);
    document.removeEventListener('keydown', onKey);
    endDrag();
  };
}
