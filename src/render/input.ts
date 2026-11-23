import * as THREE from 'three';
import type { Controller, FloorUiState } from '../app/controller';
import type { FloorRect } from '../game/floors';
import { rotatedFootprint } from '../game/grid';
import { GRID_SIZE, type Catalog } from '../game/types';
import { getCatalog } from '../themes/registry';
import type { CheckMark } from './city';
import { TURN_STEP, ZOOM_STEP, type Stage } from './stage';

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

/** Smallest ✓ hit radius in px: a 48 px target for a finger even when the ✓ is drawn smaller (zoomed out). */
export const CHECK_MIN_RADIUS_PX = 24;
const markAt = new THREE.Vector3(); // reused: the ✓ is tested on every mouse move

/**
 * Pure: does the point (x, y), in px from the canvas's top-left on a `width` x `height` canvas, land
 * on the ✓? It is drawn as a camera-facing disc `mark.size` × (height / 2) / depth px across (the
 * PointsMaterial size attenuation); the hit area is that disc, or CHECK_MIN_RADIUS_PX if bigger.
 */
export function hitsCheckMark(
  x: number, y: number, mark: CheckMark, camera: THREE.Camera, width: number, height: number,
): boolean {
  const v = markAt.copy(mark.center).applyMatrix4(camera.matrixWorldInverse);
  const depth = -v.z;
  if (!(depth > 0)) return false;
  v.applyMatrix4(camera.projectionMatrix);
  const radius = Math.max((mark.size * height) / 4 / depth, CHECK_MIN_RADIUS_PX);
  return Math.hypot(x - ((v.x + 1) / 2) * width, y - ((1 - v.y) / 2) * height) <= radius;
}

/**
 * Pure: the key as a US keyboard names it, letters in lower case. With a Thai layout on, Q types ๆ
 * and = types ช: a non-Latin character falls back to the physical key, so the shortcuts still work.
 */
export function shortcutKey(e: Pick<KeyboardEvent, 'key' | 'code'>): string {
  const { key, code } = e;
  if (key.length !== 1) return key;
  if (key.charCodeAt(0) > 0x7f) {
    const letter = /^Key([A-Z])$/.exec(code ?? '');
    if (letter) return letter[1].toLowerCase();
    if (code === 'Equal') return '=';
    if (code === 'Minus') return '-';
    return key;
  }
  return key.toLowerCase();
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

export interface Cell { tx: number; tz: number }

/**
 * Pure: who owns a new press on the map. With the floor drawer open, the 🖌 tool paints with a
 * finger, a pen or the left mouse button (the other buttons keep the camera's pan); the ✋ tool
 * leaves every press to the camera. With the drawer shut, the item rules apply.
 */
export function pressAction(
  floor: Pick<FloorUiState, 'open' | 'tool'>, p: { pointerType: string; button: number },
): 'paint' | 'camera' | 'items' {
  if (!floor.open) return 'items';
  if (floor.tool === 'camera') return 'camera';
  return p.pointerType === 'mouse' && p.button !== 0 ? 'camera' : 'paint';
}

/** A paint stroke: the cell it was pressed on, the cell under the pointer now, and whether it has been elsewhere. */
export interface Stroke { start: Cell; end: Cell; left: boolean }

/** Pure: the stroke's rectangle, from the press cell to the cell under the pointer. */
export const strokeRect = (s: Stroke): FloorRect => ({ x0: s.start.tx, z0: s.start.tz, x1: s.end.tx, z1: s.end.tz });

/**
 * Pure: a release paints the stroke's rectangle (a press that never left its cell paints that one
 * cell), except that dragging back to the start cell cancels, as in The Sims.
 */
export function strokeOnRelease(s: Stroke): 'paint' | 'cancel' {
  return s.left && s.end.tx === s.start.tx && s.end.tz === s.start.tz ? 'cancel' : 'paint';
}

export interface InputOptions {
  catalogOf?: (themeId: string) => Catalog | undefined;
  /** World-space box of the visible ghost (footprint x item height), or null. */
  ghostBox?: () => THREE.Box3 | null;
  /** The ✓ over a valid ghost (a tap on it places), or null when there is none to tap (no ghost, the ✗). */
  checkMark?: () => CheckMark | null;
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

  /** The pointer is on the ✓ (only shown over a valid ghost). */
  const onCheck = (clientX: number, clientY: number, r: DOMRect = canvas.getBoundingClientRect()): boolean => {
    const mark = opts.checkMark?.() ?? null;
    return mark !== null && hitsCheckMark(clientX - r.left, clientY - r.top, mark, camera, r.width, r.height);
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
    hoverFloorPreview(tx, tz);
  };
  /** Floor mode (🖌, drawer open, no stroke): the free mouse shows the one cell under it, as a tap would paint. */
  const hoverFloorPreview = (tx: number, tz: number): void => {
    if (stroke || floorMode()?.tool !== 'paint') return;
    if (tx >= 0) c.previewFloors({ x0: tx, z0: tz, x1: tx, z1: tz });
    else if (c.getState().floor.preview) c.previewFloors(null);
  };
  let lastX = 0;
  let lastY = 0;
  let overCanvas = false; // a free mouse last reported a position over the canvas
  let cursor = '';
  /** The hand over the ✓ tells a mouse it can be clicked. */
  const setCursor = (v: string): void => {
    if (v === cursor) return;
    cursor = v;
    canvas.style.cursor = v;
  };
  const hideHover = (): void => setHover(-1, -1);
  const hoverAt = (x: number, y: number): void => {
    if (opts.isBlocked?.()) { setCursor(''); hideHover(); return; }
    const r = canvas.getBoundingClientRect();
    // Over the ✓ a click places the ghost where it is: no faint preview elsewhere.
    if (onCheck(x, y, r)) { setCursor('pointer'); hideHover(); return; }
    setCursor('');
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
  /** The press being watched for a tap; `check`: it landed on the ✓, so a tap places instead of moving the ghost. */
  let press: { id: number; x: number; y: number; t: number; camPos: THREE.Vector3; target: THREE.Vector3; check: boolean } | null = null;
  let dragging = false;
  let multi = false; // a second finger joined this gesture: never a tap, never a ghost drag

  // Floor painting -------------------------------------------------------------------------------
  /** The floor drawer's state while it is open over a city; null when the item rules apply. */
  const floorMode = (): FloorUiState | null => {
    const s = c.getState();
    return s.floor.open && s.screen !== 'theme-select' ? s.floor : null;
  };
  const painting = (): boolean => floorMode()?.tool === 'paint';
  // 🖌 paints with one finger and the left button, so those must not orbit. OrbitControls still
  // tracks every pointer, so two fingers pinch and pan (and cancel the stroke); right-drag pans
  // and the wheel zooms in either tool. ✋ and the item rules get the camera's own mapping back.
  const cameraOne = controls.touches.ONE;
  const cameraLeft = controls.mouseButtons.LEFT;
  const lendCamera = (paintTool: boolean): void => {
    controls.touches.ONE = paintTool ? null : cameraOne;
    controls.mouseButtons.LEFT = paintTool ? null : cameraLeft;
  };
  /** The stroke being dragged; (x, y) is where it was pressed, `moved` once it went past a tap's wobble. */
  let stroke: (Stroke & { id: number; x: number; y: number; moved: boolean }) | null = null;
  const startStroke = (e: PointerEvent): void => {
    const tile = pick(e, false);
    if (!tile) return; // pressed off the map
    stroke = { id: e.pointerId, start: tile, end: { ...tile }, left: false, x: e.clientX, y: e.clientY, moved: false };
    c.previewFloors(strokeRect(stroke));
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  };
  /**
   * Follow the pointer; the preview changes only when the cell under it does (off the map: the edge
   * cell). Until the pointer goes past a tap's few pixels the stroke stays on its press cell, so a
   * tap is one cell even on a cell edge or while the camera still glides after a turn.
   */
  const moveStroke = (e: PointerEvent): void => {
    if (!stroke) return;
    if (!painting()) { stroke = null; return; } // the drawer closed or the tool changed: their preview is already gone
    if (!stroke.moved) {
      if (Math.hypot(e.clientX - stroke.x, e.clientY - stroke.y) <= TAP_MAX_MOVE_PX) return;
      stroke.moved = true;
    }
    const tile = pick(e, true);
    if (!tile || (tile.tx === stroke.end.tx && tile.tz === stroke.end.tz)) return;
    stroke.end = tile;
    if (tile.tx !== stroke.start.tx || tile.tz !== stroke.start.tz) stroke.left = true;
    c.previewFloors(strokeRect(stroke));
  };
  /** A second finger, Escape, a lost pointer: no paint, the preview goes; the rest of the gesture paints nothing. */
  const cancelStroke = (): void => {
    if (!stroke) return;
    stroke = null;
    if (c.getState().floor.preview) c.previewFloors(null);
  };
  const endStroke = (e: PointerEvent): void => {
    moveStroke(e);
    const s = stroke;
    stroke = null;
    if (!s) return;
    if (strokeOnRelease(s) === 'paint') c.paintFloors(strokeRect(s));
    else c.previewFloors(null);
  };

  const endDrag = () => {
    if (dragging) {
      dragging = false;
      controls.enabled = true;
    }
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') { overCanvas = false; hideHover(); }
    stage.rig.settle(); // a press in the middle of a turn: it ends on its 45 degree step first
    const floor = floorMode();
    // Runs before OrbitControls sees the press (capture): a new gesture gets the current tool's mapping.
    if (pointers.size === 0) lendCamera(floor?.tool === 'paint');
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // A popover, the shortcuts panel or a dialog is open: this press only closes it. Orbit and pinch stay with the controls.
    if (opts.isBlocked?.()) { press = null; return; }
    pointers.add(e.pointerId);
    if (pointers.size > 1) {
      multi = true;
      endDrag();
      cancelStroke();
      press = null;
      return;
    }
    multi = false;
    if (floor) {
      press = null; // floor mode never taps or drags items
      if (pressAction(floor, e) === 'paint') startStroke(e);
      return;
    }
    press = {
      id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(),
      camPos: camera.position.clone(), target: controls.target.clone(), check: onCheck(e.clientX, e.clientY),
    };
    // A press on the ✓ grabs the ghost too (on a 1x1 item the ✓ disc covers it): a tap on the ✓ places, a drag moves the ghost.
    if (press.check || onGhost(e)) {
      dragging = true;
      controls.enabled = false;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && !dragging && pointers.size === 0) updateHover(e);
    if (stroke && e.pointerId === stroke.id) { moveStroke(e); return; }
    if (!dragging || !press || e.pointerId !== press.id || multi) return;
    // A finger's wobble on the ✓ is still a tap: the ghost only follows once the press has really moved.
    if (press.check && Math.hypot(e.clientX - press.x, e.clientY - press.y) <= TAP_MAX_MOVE_PX) return;
    const tile = pick(e, true);
    if (tile) c.dragGhostTo(tile.tx, tile.tz);
  };

  const onUp = (e: PointerEvent) => {
    handleUp(e);
    if (e.pointerType === 'mouse' && pointers.size === 0 && !dragging) updateHover(e);
  };

  const handleUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (stroke && e.pointerId === stroke.id) endStroke(e);
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
      if (p.check) { c.place(); return; }
      const tile = pick(e, false);
      if (tile) c.tapTile(tile.tx, tile.tz);
    }
  };

  const onLeave = () => { overCanvas = false; setCursor(''); hideHover(); };

  const onCancel = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (stroke?.id === e.pointerId) cancelStroke();
    press = null;
    if (pointers.size === 0) multi = false;
    endDrag();
  };

  /** The browser took the pointer away (or never delivered its release): end the gesture cleanly. */
  const onLost = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (stroke?.id === e.pointerId) cancelStroke();
    if (press?.id === e.pointerId) press = null;
    if (pointers.size === 0) multi = false;
    endDrag();
  };

  const onBlur = () => {
    overCanvas = false;
    setCursor('');
    hideHover();
    pointers.clear();
    cancelStroke();
    press = null;
    multi = false;
    endDrag();
    controls.enabled = true;
  };

  const onKey = (e: KeyboardEvent) => {
    if (opts.isBlocked?.()) return;
    if (floorMode()) {
      // The drawer is open: the item keys rest. Escape drops the stroke being dragged, else closes the drawer.
      if (e.key === 'Escape') {
        if (stroke) cancelStroke(); else c.closeFloors();
        e.preventDefault();
      }
      return;
    }
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
    const key = shortcutKey(e);
    // Holding Q/E must not stack 45 degree turns into a long spin (＋/－ may repeat: a held key zooms on).
    if (e.repeat && (key === 'q' || key === 'e')) { e.preventDefault(); return; }
    switch (key) {
      case 'r': c.rotateGhost(); break;
      case 'Enter': case ' ': c.place(); break;
      // ⟲ / ⟳ and the zoom buttons' keys: Q turns like ⟲, E like ⟳; + or = zooms in, - zooms out.
      case 'q': stage.rig.turn(-TURN_STEP); break;
      case 'e': stage.rig.turn(TURN_STEP); break;
      case '+': case '=': stage.rig.zoomBy(ZOOM_STEP); break;
      case '-': case '_': stage.rig.zoomBy(-ZOOM_STEP); break;
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
    lendCamera(false);
    setCursor('');
  };
}
