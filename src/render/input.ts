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
  out?: { tx: number; tz: number },
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
  if (out) { out.tx = tx; out.tz = tz; return out; }
  return { tx, tz };
}

/** Does the pointer ray pass through the box (the ghost's footprint x height)? */
export function rayHitsBox(r: THREE.Ray, box: THREE.Box3): boolean {
  return r.intersectsBox(box);
}

const QUARTER = Math.PI / 2;
const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/**
 * Arrow key -> grid step as seen on screen. `azimuthRad` is the camera's angle around the map
 * (atan2(x, z) of camera - target), rounded to the nearest quarter turn so "up" always moves away
 * from the viewer. Exactly diagonal views (the default 45 degrees) resolve to the world axes.
 */
export function screenArrowToGrid(key: string, azimuthRad: number): { dx: number; dz: number } | null {
  if (!ARROWS.has(key)) return null;
  const k = Math.ceil(azimuthRad / QUARTER - 0.5 - 1e-6);
  const s = Math.round(Math.sin(k * QUARTER));
  const c = Math.round(Math.cos(k * QUARTER));
  // `+ 0` turns -0 into 0
  switch (key) {
    case 'ArrowUp': return { dx: -s + 0, dz: -c + 0 };
    case 'ArrowDown': return { dx: s + 0, dz: c + 0 };
    case 'ArrowLeft': return { dx: -c + 0, dz: s + 0 };
    default: return { dx: c + 0, dz: -s + 0 };
  }
}

export interface InputOptions {
  catalogOf?: (themeId: string) => Catalog | undefined;
  /** World-space box of the visible ghost (footprint x item height), or null. */
  ghostBox?: () => THREE.Box3 | null;
  /** True while an overlay (settings, dialog, end screen) owns the keyboard. */
  isBlocked?: () => boolean;
  /** Mouse hover: the tile under the cursor, or null when the preview should hide. Fires only on change. */
  onHover?: (tile: { tx: number; tz: number } | null) => void;
}

export function attachInput(stage: Stage, c: Controller, opts: InputOptions = {}): () => void {
  const catalogOf = opts.catalogOf ?? getCatalog;
  const { canvas, controls, camera } = stage;
  canvas.style.touchAction = 'none';

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const aim = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
  };
  const pick = (e: PointerEvent, clamp: boolean) => {
    aim(e);
    return rayToTile(ray.ray.origin, ray.ray.direction, clamp);
  };

  /** The press lands on the ghost: on its ground footprint, or anywhere on its body (tall items). */
  const onGhost = (e: PointerEvent): boolean => {
    const s = c.getState();
    if (!s.ghost || !s.game || s.screen !== 'playing') return false;
    const spec = catalogOf(s.game.themeId)?.items[s.game.current];
    if (!spec) return false;
    const tile = pick(e, false); // also leaves the pointer ray in `ray`
    if (tile) {
      const { w, d } = rotatedFootprint(spec.footprint, s.ghost.rotation);
      if (tile.tx >= s.ghost.x && tile.tx < s.ghost.x + w && tile.tz >= s.ghost.z && tile.tz < s.ghost.z + d) return true;
    }
    const box = opts.ghostBox?.() ?? null;
    return box !== null && rayHitsBox(ray.ray, box);
  };

  // Mouse hover: report the tile under a free-moving mouse; hide on press, leave, blocked overlays.
  const hoverOut = { tx: 0, tz: 0 };
  let hoverTx = -1;
  let hoverTz = -1;
  const setHover = (tx: number, tz: number): void => {
    if (tx === hoverTx && tz === hoverTz) return;
    hoverTx = tx;
    hoverTz = tz;
    opts.onHover?.(tx < 0 ? null : { tx, tz });
  };
  let lastX = 0;
  let lastY = 0;
  let overCanvas = false; // a free mouse last reported a position over the canvas
  const hideHover = (): void => setHover(-1, -1);
  const hoverAt = (x: number, y: number): void => {
    if (opts.isBlocked?.()) { hideHover(); return; }
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    const tile = rayToTile(ray.ray.origin, ray.ray.direction, false, hoverOut);
    if (tile) setHover(tile.tx, tile.tz); else hideHover();
  };
  const updateHover = (e: PointerEvent): void => {
    if (e.pointerType !== 'mouse' || e.buttons !== 0 || e.target !== canvas) { overCanvas = false; hideHover(); return; }
    overCanvas = true;
    lastX = e.clientX;
    lastY = e.clientY;
    hoverAt(lastX, lastY);
  };
  /** The camera moved without a pointer event (wheel, keys, inertia): the tile under the cursor changed. */
  const onCameraChange = (): void => {
    if (overCanvas && pointers.size === 0 && !dragging) hoverAt(lastX, lastY);
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
    if (e.pointerType === 'mouse') { overCanvas = false; hideHover(); }
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
    if (onGhost(e)) {
      dragging = true;
      controls.enabled = false;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && !dragging && pointers.size === 0) updateHover(e);
    if (!dragging || !press || e.pointerId !== press.id || multi) return;
    const tile = pick(e, true);
    if (tile) c.dragGhostTo(tile.tx, tile.tz);
  };

  const onUp = (e: PointerEvent) => {
    handleUp(e);
    if (e.pointerType === 'mouse' && pointers.size === 0 && !dragging) updateHover(e);
  };

  const handleUp = (e: PointerEvent) => {
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

  const onLeave = () => { overCanvas = false; hideHover(); };

  const onCancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    press = null;
    if (pointers.size === 0) multi = false;
    endDrag();
  };

  /** The browser took the pointer away (or never delivered its release): end the gesture cleanly. */
  const onLost = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (press?.id === e.pointerId) press = null;
    if (pointers.size === 0) multi = false;
    endDrag();
  };

  const onBlur = () => {
    overCanvas = false;
    hideHover();
    pointers.clear();
    press = null;
    multi = false;
    endDrag();
    controls.enabled = true;
  };

  const onKey = (e: KeyboardEvent) => {
    if (opts.isBlocked?.()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    const tag = t?.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;
    const step = screenArrowToGrid(e.key, controls.getAzimuthalAngle());
    if (step) {
      c.moveGhost(step.dx, step.dz);
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case 'r': case 'R': c.rotateGhost(); break;
      case 'Enter': case ' ': c.place(); break;
      default: return;
    }
    e.preventDefault();
  };

  const cap = { capture: true } as const;
  canvas.addEventListener('pointerdown', onDown, cap);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  controls.addEventListener('change', onCameraChange);
  canvas.addEventListener('lostpointercapture', onLost);
  // Release/cancel are listened for on window: they bubble from the canvas, and still arrive when
  // the pointer is released elsewhere or capture failed.
  window.addEventListener('pointerup', onUp, cap);
  window.addEventListener('pointercancel', onCancel, cap);
  window.addEventListener('blur', onBlur);
  document.addEventListener('keydown', onKey);
  return () => {
    canvas.removeEventListener('pointerdown', onDown, cap);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    controls.removeEventListener('change', onCameraChange);
    canvas.removeEventListener('lostpointercapture', onLost);
    window.removeEventListener('pointerup', onUp, cap);
    window.removeEventListener('pointercancel', onCancel, cap);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('keydown', onKey);
    endDrag();
  };
}
