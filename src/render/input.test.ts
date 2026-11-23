// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { AppState, Controller, FloorUiState } from '../app/controller';
import type { CheckMark } from './city';
import {
  attachInput, CHECK_MIN_RADIUS_PX, hitsCheckMark, pressAction, rayHitsBox, screenArrowToGrid, shortcutKey, strokeOnRelease,
  type InputOptions,
} from './input';
import { TURN_STEP, ZOOM_STEP, type Stage } from './stage';

describe('screenArrowToGrid', () => {
  const Q = Math.PI / 2;
  it('default view (azimuth 45deg) keeps world axes', () => {
    const a = Math.PI / 4;
    expect(screenArrowToGrid('ArrowUp', a)).toEqual({ dx: 0, dz: -1 });
    expect(screenArrowToGrid('ArrowDown', a)).toEqual({ dx: 0, dz: 1 });
    expect(screenArrowToGrid('ArrowLeft', a)).toEqual({ dx: -1, dz: 0 });
    expect(screenArrowToGrid('ArrowRight', a)).toEqual({ dx: 1, dz: 0 });
  });
  it('camera orbited a quarter turn: up moves away from the viewer', () => {
    // camera on +x looking toward -x: away is -x, screen-right is -z
    expect(screenArrowToGrid('ArrowUp', Q)).toEqual({ dx: -1, dz: 0 });
    expect(screenArrowToGrid('ArrowRight', Q)).toEqual({ dx: 0, dz: -1 });
    // camera on -z (azimuth 180deg): away is +z, right is -x
    expect(screenArrowToGrid('ArrowUp', 2 * Q)).toEqual({ dx: 0, dz: 1 });
    expect(screenArrowToGrid('ArrowRight', 2 * Q)).toEqual({ dx: -1, dz: 0 });
    // camera on -x (azimuth -90deg): away is +x, right is +z
    expect(screenArrowToGrid('ArrowUp', -Q)).toEqual({ dx: 1, dz: 0 });
    expect(screenArrowToGrid('ArrowLeft', -Q)).toEqual({ dx: 0, dz: -1 });
  });
  it('rounds to the nearest quarter turn and ignores other keys', () => {
    expect(screenArrowToGrid('ArrowUp', Q + 0.3)).toEqual({ dx: -1, dz: 0 });
    expect(screenArrowToGrid('ArrowUp', 0.3)).toEqual({ dx: 0, dz: -1 });
    expect(screenArrowToGrid('a', 0)).toBeNull();
  });
});

describe('rayHitsBox', () => {
  const box = new THREE.Box3(new THREE.Vector3(4, 0, 4), new THREE.Vector3(6, 3, 6));
  it('hits the upper body even though the ray lands on the ground behind the footprint', () => {
    const origin = new THREE.Vector3(5, 3.5, 12);
    const dir = new THREE.Vector3(0, -0.3, -1).normalize(); // at z=6 it is still 1.7 high
    const t = -origin.y / dir.y; // ground hit
    expect(origin.z + dir.z * t).toBeLessThan(4); // lands behind the footprint (z < 4)
    expect(rayHitsBox(new THREE.Ray(origin, dir), box)).toBe(true);
  });
  it('misses a ray that passes above the top or beside the box', () => {
    expect(rayHitsBox(new THREE.Ray(new THREE.Vector3(5, 6, 12), new THREE.Vector3(0, -0.1, -1).normalize()), box)).toBe(false);
    expect(rayHitsBox(new THREE.Ray(new THREE.Vector3(9, 3, 12), new THREE.Vector3(0, -0.2, -1).normalize()), box)).toBe(false);
  });
});

function setup(blocked: () => boolean, onHover?: (t: { tx: number; tz: number } | null) => void, extra: InputOptions = {}) {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON() {} });
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(16, 13, 16);
  camera.lookAt(5, 0, 5);
  camera.updateMatrixWorld(true);
  const controls = {
    enabled: true, enableDamping: true, target: new THREE.Vector3(5, 0, 5),
    update: vi.fn(), getAzimuthalAngle: () => Math.PI / 4,
    touches: { ONE: THREE.TOUCH.ROTATE as THREE.TOUCH | null, TWO: THREE.TOUCH.DOLLY_PAN as THREE.TOUCH | null },
    mouseButtons: {
      LEFT: THREE.MOUSE.ROTATE as THREE.MOUSE | null, MIDDLE: THREE.MOUSE.DOLLY as THREE.MOUSE | null,
      RIGHT: THREE.MOUSE.PAN as THREE.MOUSE | null,
    },
    listeners: new Set<() => void>(),
    addEventListener(_t: string, fn: () => void) { this.listeners.add(fn); },
    removeEventListener(_t: string, fn: () => void) { this.listeners.delete(fn); },
  };
  const rig = { turn: vi.fn(), zoomBy: vi.fn(), settle: vi.fn() };
  const stage = { canvas, camera, controls, rig } as unknown as Stage;
  const floor: FloorUiState = { open: false, pick: 'wood-light', tool: 'paint', preview: null };
  const state = { screen: 'playing', game: null, ghost: null, floor } as unknown as AppState;
  const listeners = new Set<(s: AppState) => void>();
  const c = {
    getState: () => state,
    subscribe: (fn: (s: AppState) => void) => { listeners.add(fn); return () => void listeners.delete(fn); },
    moveGhost: vi.fn(), rotateGhost: vi.fn(), place: vi.fn(() => true), dragGhostTo: vi.fn(), tapTile: vi.fn(),
    previewFloors: vi.fn((r: FloorUiState['preview']) => { floor.preview = r; }),
    paintFloors: vi.fn(() => { floor.preview = null; }),
    closeFloors: vi.fn(),
  } as unknown as Controller & {
    previewFloors: ReturnType<typeof vi.fn>; paintFloors: ReturnType<typeof vi.fn>; closeFloors: ReturnType<typeof vi.fn>; tapTile: ReturnType<typeof vi.fn>;
  };
  const dispose = attachInput(stage, c, { isBlocked: blocked, onHover, ...extra });
  /** The controller announces a new state (as after a key moved the ghost or an item was placed). */
  const emit = () => { for (const fn of listeners) fn(state); };
  return { canvas, camera, controls, c, floor, state, rig, dispose, emit, listeners };
}

describe('attachInput keyboard', () => {
  it('shortcuts act when not blocked and do nothing while blocked', () => {
    let blocked = false;
    const { c, dispose } = setup(() => blocked);
    const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    press('ArrowRight');
    press('Enter');
    press('r');
    expect(c.moveGhost).toHaveBeenCalledWith(1, 0);
    expect(c.place).toHaveBeenCalledTimes(1);
    expect(c.rotateGhost).toHaveBeenCalledTimes(1);
    blocked = true;
    press('ArrowRight');
    press('Enter');
    press(' ');
    press('r');
    expect(c.moveGhost).toHaveBeenCalledTimes(1);
    expect(c.place).toHaveBeenCalledTimes(1);
    expect(c.rotateGhost).toHaveBeenCalledTimes(1);
    dispose();
  });
});

describe('attachInput pointer robustness', () => {
  const ptr = (type: string, id: number, x = 0, y = 0) =>
    new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, button: 0, bubbles: true });

  it('window blur clears stale pointers and re-enables controls', () => {
    const { canvas, controls, c, dispose } = setup(() => false);
    canvas.dispatchEvent(ptr('pointerdown', 1));
    canvas.dispatchEvent(ptr('pointerdown', 2)); // a second finger: multi-touch
    controls.enabled = false; // as if a drag had started
    window.dispatchEvent(new Event('blur'));
    expect(controls.enabled).toBe(true);
    // the next single tap must not be treated as multi-touch any more
    canvas.dispatchEvent(ptr('pointerdown', 3, 400, 300));
    window.dispatchEvent(ptr('pointerup', 3, 400, 300));
    expect(c.tapTile).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('a right-button press (mouse pan) is never a tap or a ghost drag', () => {
    const { canvas, controls, c, dispose } = setup(() => true);
    const right = (type: string) =>
      new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', clientX: 400, clientY: 300, button: 2, bubbles: true });
    canvas.dispatchEvent(right('pointerdown'));
    window.dispatchEvent(right('pointerup'));
    expect(c.tapTile).not.toHaveBeenCalled();
    expect(c.dragGhostTo).not.toHaveBeenCalled();
    expect(controls.enabled).toBe(true);
    dispose();
  });

  it('a two-finger gesture (pinch / pan) never taps, even if one finger lifts without moving', () => {
    const { canvas, c, dispose } = setup(() => false);
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 300));
    canvas.dispatchEvent(ptr('pointerdown', 2, 450, 300));
    window.dispatchEvent(ptr('pointerup', 1, 400, 300));
    window.dispatchEvent(ptr('pointerup', 2, 450, 300));
    expect(c.tapTile).not.toHaveBeenCalled();
    dispose();
  });

  it('a pointerup that only reaches window ends the gesture; the disposer removes window listeners', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { canvas, controls, dispose } = setup(() => false);
    canvas.dispatchEvent(ptr('pointerdown', 1));
    canvas.dispatchEvent(ptr('pointerdown', 2));
    window.dispatchEvent(ptr('pointerup', 1));
    window.dispatchEvent(ptr('pointerup', 2));
    expect(controls.enabled).toBe(true);
    dispose();
    for (const [type, fn] of add.mock.calls) {
      expect(remove.mock.calls.some((r) => r[0] === type && r[1] === fn)).toBe(true);
    }
    add.mockRestore();
    remove.mockRestore();
  });
});

describe('attachInput mouse hover', () => {
  const move = (type: string, x: number, y: number, extra: PointerEventInit = {}, target: EventTarget | null = null) => {
    const e = new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', clientX: x, clientY: y, buttons: 0, bubbles: true, ...extra });
    target?.dispatchEvent(e);
    return e;
  };
  const hoverSetup = (blocked: () => boolean = () => false) => {
    const calls: Array<{ tx: number; tz: number } | null> = [];
    const s = setup(blocked, (t) => calls.push(t && { ...t }));
    return { ...s, calls };
  };

  it('reports the tile under a mouse, only when the tile changes', () => {
    const { canvas, calls, dispose } = hoverSetup();
    move('pointermove', 400, 310, {}, canvas);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ tx: 5, tz: 5 });
    move('pointermove', 400.2, 310, {}, canvas); // same tile
    expect(calls).toHaveLength(1);
    move('pointermove', 520, 310, {}, canvas);
    expect(calls).toHaveLength(2);
    expect(calls[1]).not.toEqual(calls[0]);
    dispose();
  });

  it('touch and pen never show a hover preview', () => {
    const { canvas, calls, dispose } = hoverSetup();
    move('pointermove', 400, 300, { pointerType: 'touch' }, canvas);
    move('pointermove', 400, 300, { pointerType: 'pen' }, canvas);
    expect(calls.filter((c) => c !== null)).toHaveLength(0);
    dispose();
  });

  it('hides on pointerleave, blur, a mouse press and while blocked', () => {
    let blocked = false;
    const { canvas, calls, dispose } = hoverSetup(() => blocked);
    const last = () => calls[calls.length - 1];
    move('pointermove', 400, 300, {}, canvas);
    expect(last()).not.toBeNull();
    canvas.dispatchEvent(new PointerEvent('pointerleave', { pointerId: 1, pointerType: 'mouse' }));
    expect(last()).toBeNull();
    move('pointermove', 400, 300, {}, canvas);
    expect(last()).not.toBeNull();
    window.dispatchEvent(new Event('blur'));
    expect(last()).toBeNull();
    move('pointermove', 400, 300, {}, canvas);
    move('pointerdown', 400, 300, { buttons: 2, button: 2 }, canvas);
    expect(last()).toBeNull();
    window.dispatchEvent(move('pointerup', 400, 300, { button: 2 }));
    move('pointermove', 400, 300, {}, canvas);
    expect(last()).not.toBeNull();
    blocked = true;
    move('pointermove', 500, 300, {}, canvas);
    expect(last()).toBeNull();
    dispose();
  });

  it('a mouse release over a HUD button (not the canvas) does not bring the preview back', () => {
    const { canvas, calls, dispose } = hoverSetup();
    const button = document.createElement('button');
    document.body.appendChild(button);
    move('pointermove', 400, 300, {}, canvas);
    move('pointerdown', 400, 300, { button: 0, buttons: 1 }, canvas);
    expect(calls[calls.length - 1]).toBeNull();
    const up = new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 400, clientY: 300, bubbles: true });
    button.dispatchEvent(up); // bubbles to window; target is the button
    expect(calls[calls.length - 1]).toBeNull();
    dispose();
    button.remove();
  });

  it('re-evaluates under a still mouse when the camera moves (wheel, keys, inertia)', () => {
    const { canvas, camera, controls, calls, dispose } = hoverSetup();
    move('pointermove', 400, 300, {}, canvas);
    const before = calls[calls.length - 1];
    camera.position.x += 3;
    camera.lookAt(8, 0, 5);
    camera.updateMatrixWorld(true);
    controls.listeners.forEach((fn) => fn());
    const after = calls[calls.length - 1];
    expect(after).not.toBeNull();
    expect(after).not.toEqual(before);
    dispose();
  });
});

describe('floor painting decisions', () => {
  const closed = { open: false, tool: 'paint' } as const;
  const paint = { open: true, tool: 'paint' } as const;
  const camera = { open: true, tool: 'camera' } as const;
  it('pressAction: the drawer decides who owns a press on the map', () => {
    expect(pressAction(closed, { pointerType: 'touch', button: 0 })).toBe('items');
    expect(pressAction(closed, { pointerType: 'mouse', button: 0 })).toBe('items');
    expect(pressAction(paint, { pointerType: 'touch', button: 0 })).toBe('paint');
    expect(pressAction(paint, { pointerType: 'pen', button: 0 })).toBe('paint');
    expect(pressAction(paint, { pointerType: 'mouse', button: 0 })).toBe('paint');
    expect(pressAction(paint, { pointerType: 'mouse', button: 2 })).toBe('camera'); // right-drag still pans
    expect(pressAction(paint, { pointerType: 'mouse', button: 1 })).toBe('camera');
    expect(pressAction(camera, { pointerType: 'touch', button: 0 })).toBe('camera');
    expect(pressAction(camera, { pointerType: 'mouse', button: 0 })).toBe('camera');
  });
  it('strokeOnRelease: a press that stayed on its cell paints it; a drag paints; coming back to the start cancels', () => {
    const a = { tx: 3, tz: 4 };
    const b = { tx: 6, tz: 1 };
    expect(strokeOnRelease({ start: a, end: { ...a }, left: false })).toBe('paint'); // tap = one cell
    expect(strokeOnRelease({ start: a, end: b, left: true })).toBe('paint');
    expect(strokeOnRelease({ start: a, end: { ...a }, left: true })).toBe('cancel');
  });
});

describe('attachInput floor mode', () => {
  const ptr = (type: string, id: number, x: number, y: number, extra: PointerEventInit = {}) =>
    new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0, bubbles: true, ...extra });
  const open = (tool: FloorUiState['tool'] = 'paint') => {
    const s = setup(() => false);
    s.floor.open = true;
    s.floor.tool = tool;
    return s;
  };
  const one = (r: { x0: number; z0: number; x1: number; z1: number }) => r.x0 === r.x1 && r.z0 === r.z1;

  it('a tap previews the one cell under it, then paints that cell; it is never an item tap', () => {
    const { canvas, c, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    expect(c.previewFloors).toHaveBeenCalledTimes(1);
    const rect = c.previewFloors.mock.calls[0][0];
    expect(rect).toEqual({ x0: 5, z0: 5, x1: 5, z1: 5 });
    window.dispatchEvent(ptr('pointerup', 1, 400, 310));
    expect(c.paintFloors).toHaveBeenCalledWith(rect);
    expect(c.tapTile).not.toHaveBeenCalled();
    dispose();
  });

  it('a drag previews the rectangle from the press cell, only when the cell changes, and paints it on release', () => {
    const { canvas, c, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    canvas.dispatchEvent(ptr('pointermove', 1, 400.5, 310)); // same cell
    expect(c.previewFloors).toHaveBeenCalledTimes(1);
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310));
    expect(c.previewFloors).toHaveBeenCalledTimes(2);
    const rect = c.previewFloors.mock.calls[1][0];
    expect(rect).toMatchObject({ x0: 5, z0: 5 });
    expect(one(rect)).toBe(false);
    window.dispatchEvent(ptr('pointerup', 1, 520, 310));
    expect(c.paintFloors).toHaveBeenCalledExactlyOnceWith(rect);
    dispose();
  });

  it('a tap is one cell even if the view drifts (camera inertia) or the finger wobbles a few pixels', () => {
    const { canvas, camera, c, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    const rect = c.previewFloors.mock.calls[0][0];
    camera.position.x += 3; // the camera is still gliding after the last orbit
    camera.lookAt(8, 0, 5);
    camera.updateMatrixWorld(true);
    canvas.dispatchEvent(ptr('pointermove', 1, 404, 313));
    window.dispatchEvent(ptr('pointerup', 1, 404, 313));
    expect(c.paintFloors).toHaveBeenCalledExactlyOnceWith(rect);
    expect(one(rect)).toBe(true);
    dispose();
  });

  it('dragging back to the start cell cancels the stroke', () => {
    const { canvas, c, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310));
    expect(floor.preview).not.toBeNull();
    canvas.dispatchEvent(ptr('pointermove', 1, 400, 310));
    window.dispatchEvent(ptr('pointerup', 1, 400, 310));
    expect(c.paintFloors).not.toHaveBeenCalled();
    expect(floor.preview).toBeNull();
    dispose();
  });

  it('a second finger cancels the stroke and leaves the gesture to the camera', () => {
    const { canvas, controls, c, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310));
    canvas.dispatchEvent(ptr('pointerdown', 2, 600, 310));
    expect(floor.preview).toBeNull();
    expect(controls.enabled).toBe(true);
    expect(controls.touches.TWO).toBe(THREE.TOUCH.DOLLY_PAN); // two fingers pinch and pan
    canvas.dispatchEvent(ptr('pointermove', 1, 300, 310));
    window.dispatchEvent(ptr('pointerup', 2, 600, 310));
    canvas.dispatchEvent(ptr('pointermove', 1, 250, 310)); // the finger left behind paints nothing
    window.dispatchEvent(ptr('pointerup', 1, 250, 310));
    expect(c.paintFloors).not.toHaveBeenCalled();
    expect(c.previewFloors.mock.calls.at(-1)?.[0]).toBeNull();
    dispose();
  });

  it('Escape cancels the stroke; the rest of the drag and the release paint nothing', () => {
    const { canvas, c, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310, { pointerType: 'mouse' }));
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310, { pointerType: 'mouse', buttons: 1 }));
    expect(floor.preview).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(floor.preview).toBeNull();
    const calls = c.previewFloors.mock.calls.length;
    canvas.dispatchEvent(ptr('pointermove', 1, 600, 310, { pointerType: 'mouse', buttons: 1 }));
    window.dispatchEvent(ptr('pointerup', 1, 600, 310, { pointerType: 'mouse' }));
    expect(c.previewFloors).toHaveBeenCalledTimes(calls);
    expect(c.paintFloors).not.toHaveBeenCalled();
    dispose();
  });

  it('pointercancel and window blur cancel the stroke', () => {
    const { canvas, c, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    expect(floor.preview).not.toBeNull();
    window.dispatchEvent(ptr('pointercancel', 1, 400, 310));
    expect(floor.preview).toBeNull();
    canvas.dispatchEvent(ptr('pointerdown', 2, 400, 310));
    expect(floor.preview).not.toBeNull();
    window.dispatchEvent(new Event('blur'));
    expect(floor.preview).toBeNull();
    window.dispatchEvent(ptr('pointerup', 2, 400, 310));
    expect(c.paintFloors).not.toHaveBeenCalled();
    dispose();
  });

  it('the paint tool takes one finger and the left button from the camera; ✋ and closing the drawer give them back', () => {
    const { canvas, controls, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    expect(controls.touches.ONE).toBeNull();
    expect(controls.mouseButtons.LEFT).toBeNull();
    expect(controls.touches.TWO).toBe(THREE.TOUCH.DOLLY_PAN);
    expect(controls.mouseButtons.RIGHT).toBe(THREE.MOUSE.PAN);
    window.dispatchEvent(ptr('pointerup', 1, 400, 310));
    floor.tool = 'camera';
    canvas.dispatchEvent(ptr('pointerdown', 2, 400, 310));
    expect(controls.touches.ONE).toBe(THREE.TOUCH.ROTATE);
    expect(controls.mouseButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    window.dispatchEvent(ptr('pointerup', 2, 400, 310));
    floor.tool = 'paint';
    canvas.dispatchEvent(ptr('pointerdown', 3, 400, 310));
    window.dispatchEvent(ptr('pointerup', 3, 400, 310));
    floor.open = false;
    canvas.dispatchEvent(ptr('pointerdown', 4, 400, 310));
    expect(controls.touches.ONE).toBe(THREE.TOUCH.ROTATE);
    expect(controls.mouseButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    window.dispatchEvent(ptr('pointerup', 4, 400, 310));
    dispose();
    expect(controls.touches.ONE).toBe(THREE.TOUCH.ROTATE);
  });

  it('the ✋ tool neither paints nor taps items: the camera has the press', () => {
    const { canvas, c, dispose } = open('camera');
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    window.dispatchEvent(ptr('pointerup', 1, 400, 310));
    expect(c.previewFloors).not.toHaveBeenCalled();
    expect(c.paintFloors).not.toHaveBeenCalled();
    expect(c.tapTile).not.toHaveBeenCalled();
    dispose();
  });

  it('a stroke whose drawer was closed meanwhile (a second finger on เสร็จ) paints nothing', () => {
    const { canvas, c, floor, dispose } = open();
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    floor.open = false;
    floor.preview = null;
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310));
    window.dispatchEvent(ptr('pointerup', 1, 520, 310));
    expect(c.previewFloors).toHaveBeenCalledTimes(1); // only the press
    expect(c.paintFloors).not.toHaveBeenCalled();
    dispose();
  });

  it('Escape closes the drawer when no stroke is active, but only cancels the stroke when one is', () => {
    const { canvas, c, dispose } = open();
    const esc = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310));
    esc();
    expect(c.closeFloors).not.toHaveBeenCalled();
    window.dispatchEvent(ptr('pointerup', 1, 400, 310));
    esc();
    expect(c.closeFloors).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('Escape does nothing to the drawer when an overlay owns the keyboard, or when it is shut', () => {
    let blocked = false;
    const s = setup(() => blocked);
    const esc = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    esc(); // shut
    s.floor.open = true;
    blocked = true;
    esc();
    expect(s.c.closeFloors).not.toHaveBeenCalled();
    s.dispose();
  });

  it('a free mouse over the map previews the one cell under it; leaving the canvas clears it', () => {
    const { canvas, c, floor, dispose } = open();
    const mv = (x: number, y: number) => canvas.dispatchEvent(ptr('pointermove', 1, x, y, { pointerType: 'mouse', buttons: 0 }));
    mv(400, 310);
    expect(c.previewFloors).toHaveBeenLastCalledWith({ x0: 5, z0: 5, x1: 5, z1: 5 });
    mv(401, 311); // same cell: no new call
    expect(c.previewFloors).toHaveBeenCalledTimes(1);
    mv(520, 310);
    expect(floor.preview).not.toBeNull();
    expect(c.previewFloors).toHaveBeenCalledTimes(2);
    canvas.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    expect(floor.preview).toBeNull();
    dispose();
  });

  it('the hover preview is mouse only, paint tool only, drawer open only', () => {
    const touch = open();
    touch.canvas.dispatchEvent(ptr('pointermove', 1, 400, 310)); // finger
    expect(touch.c.previewFloors).not.toHaveBeenCalled();
    touch.dispose();
    const hand = open('camera');
    hand.canvas.dispatchEvent(ptr('pointermove', 1, 400, 310, { pointerType: 'mouse', buttons: 0 }));
    expect(hand.c.previewFloors).not.toHaveBeenCalled();
    hand.dispose();
    const shut = setup(() => false);
    shut.canvas.dispatchEvent(ptr('pointermove', 1, 400, 310, { pointerType: 'mouse', buttons: 0 }));
    expect(shut.c.previewFloors).not.toHaveBeenCalled();
    shut.dispose();
  });

  it('pressing with the mouse swaps the hover for the stroke, and the hover returns after the release', () => {
    const { canvas, c, floor, dispose } = open();
    const m = { pointerType: 'mouse' };
    canvas.dispatchEvent(ptr('pointermove', 1, 400, 310, { ...m, buttons: 0 }));
    canvas.dispatchEvent(ptr('pointerdown', 1, 400, 310, m));
    expect(floor.preview).toEqual({ x0: 5, z0: 5, x1: 5, z1: 5 });
    canvas.dispatchEvent(ptr('pointermove', 1, 520, 310, { ...m, buttons: 1 }));
    expect(c.previewFloors.mock.calls.at(-1)?.[0]).toMatchObject({ x0: 5, z0: 5 });
    window.dispatchEvent(ptr('pointerup', 1, 520, 310, m));
    expect(c.paintFloors).toHaveBeenCalledTimes(1);
    expect(c.previewFloors.mock.calls.at(-1)?.[0]).toMatchObject({ x0: expect.any(Number) }); // hover back under the cursor
    dispose();
  });

  it('picks the right cell while the view is shifted up for the drawer (setViewOffset)', () => {
    const { canvas, camera, c, dispose } = open();
    const w = 800, h = 600, shift = 150;
    const cell = new THREE.Vector3(7.5, 0, 6.5);
    const atScreen = (): { x: number; y: number } => {
      const p = cell.clone().project(camera);
      return { x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h };
    };
    const before = atScreen();
    camera.setViewOffset(w, h, 0, shift, w, h);
    const after = atScreen();
    expect(after.y).toBeCloseTo(before.y - shift, 3); // the view moved up by the shift
    canvas.dispatchEvent(ptr('pointerdown', 1, after.x, after.y));
    expect(c.previewFloors).toHaveBeenLastCalledWith({ x0: 7, z0: 6, x1: 7, z1: 6 });
    window.dispatchEvent(ptr('pointerup', 1, after.x, after.y));
    dispose();
  });

  it('while the drawer is open the item keys (arrows, R, Enter, space) do nothing', () => {
    const { c, dispose } = open();
    for (const key of ['ArrowRight', 'r', 'Enter', ' ']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    expect(c.moveGhost).not.toHaveBeenCalled();
    expect(c.rotateGhost).not.toHaveBeenCalled();
    expect(c.place).not.toHaveBeenCalled();
    dispose();
  });
});

describe('shortcutKey', () => {
  const k = (key: string, code = '') => shortcutKey({ key, code });
  it('names letters in lower case and leaves other keys as they are', () => {
    expect(k('Q', 'KeyQ')).toBe('q');
    expect(k('e', 'KeyE')).toBe('e');
    expect(k('+', 'Equal')).toBe('+');
    expect(k('Enter', 'Enter')).toBe('Enter');
    expect(k(' ', 'Space')).toBe(' ');
    expect(k('ArrowUp', 'ArrowUp')).toBe('ArrowUp');
  });
  it('a Thai layout (ๆ on Q, ช on =, ข on -) still names the key under the finger', () => {
    expect(k('ๆ', 'KeyQ')).toBe('q');
    expect(k('ำ', 'KeyE')).toBe('e');
    expect(k('พ', 'KeyR')).toBe('r');
    expect(k('ช', 'Equal')).toBe('=');
    expect(k('ข', 'Minus')).toBe('-');
  });
  it('a Latin layout keeps the typed letter (AZERTY: the A key is KeyQ but types a)', () => {
    expect(k('a', 'KeyQ')).toBe('a');
  });
});

describe('attachInput camera keys', () => {
  const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));

  it('Q / E turn the view 45 degrees, + = / - zoom by a step', () => {
    const { rig, dispose } = setup(() => false);
    press('q');
    press('E');
    expect(rig.turn.mock.calls).toEqual([[-TURN_STEP], [TURN_STEP]]);
    press('+');
    press('=');
    press('-');
    expect(rig.zoomBy.mock.calls).toEqual([[ZOOM_STEP], [ZOOM_STEP], [-ZOOM_STEP]]);
    dispose();
  });

  it('holding Q / E turns once (no auto-repeat spin); ＋/－ may repeat', () => {
    const { rig, dispose } = setup(() => false);
    press('q');
    press('q', { repeat: true });
    press('e', { repeat: true });
    expect(rig.turn.mock.calls).toEqual([[-TURN_STEP]]);
    press('+');
    press('+', { repeat: true });
    expect(rig.zoomBy).toHaveBeenCalledTimes(2);
    dispose();
  });

  it('a press on the map settles a glide first', () => {
    const { canvas, rig, dispose } = setup(() => false);
    canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 10, clientY: 10, button: 0, bubbles: true }));
    expect(rig.settle).toHaveBeenCalled();
    dispose();
  });

  it('work with a Thai layout on', () => {
    const { rig, c, dispose } = setup(() => false);
    press('ๆ', { code: 'KeyQ' });
    press('ข', { code: 'Minus' });
    press('พ', { code: 'KeyR' });
    expect(rig.turn).toHaveBeenCalledWith(-TURN_STEP);
    expect(rig.zoomBy).toHaveBeenCalledWith(-ZOOM_STEP);
    expect(c.rotateGhost).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('do nothing while an overlay owns the keyboard, with the drawer open, in a field, or with Ctrl (browser zoom)', () => {
    let blocked = true;
    const { rig, floor, dispose } = setup(() => blocked);
    for (const key of ['q', 'e', '+', '-']) press(key);
    blocked = false;
    floor.open = true;
    for (const key of ['q', 'e', '+', '-']) press(key);
    floor.open = false;
    const field = document.createElement('input');
    document.body.appendChild(field);
    for (const key of ['q', 'e', '+', '-']) press(key, {}, field);
    field.remove();
    press('+', { ctrlKey: true });
    press('-', { metaKey: true });
    expect(rig.turn).not.toHaveBeenCalled();
    expect(rig.zoomBy).not.toHaveBeenCalled();
    dispose();
  });
});

describe('hitsCheckMark', () => {
  const camera = new THREE.PerspectiveCamera(40, 800 / 600, 0.1, 100);
  camera.position.set(16, 13, 16);
  camera.lookAt(5, 0, 5);
  camera.updateMatrixWorld(true);
  const W = 800;
  const H = 600;
  const screenOf = (p: THREE.Vector3) => {
    const v = p.clone().project(camera);
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
  };
  const mark = (size: number, at = new THREE.Vector3(5, 2, 5)): CheckMark => ({ center: at, size });
  const depth = (p: THREE.Vector3) => -p.clone().applyMatrix4(camera.matrixWorldInverse).z;

  it('hits on the ✓ and misses well beside it', () => {
    const m = mark(2.3);
    const c = screenOf(m.center);
    expect(hitsCheckMark(c.x, c.y, m, camera, W, H)).toBe(true);
    expect(hitsCheckMark(c.x + 80, c.y, m, camera, W, H)).toBe(false);
    expect(hitsCheckMark(c.x, c.y - 80, m, camera, W, H)).toBe(false);
  });

  it('a ✓ drawn small (zoomed out) still takes a 48 px finger', () => {
    const m = mark(0.5);
    const drawnRadius = (m.size * H) / 4 / depth(m.center);
    expect(drawnRadius).toBeLessThan(CHECK_MIN_RADIUS_PX);
    const c = screenOf(m.center);
    expect(hitsCheckMark(c.x + CHECK_MIN_RADIUS_PX - 1, c.y, m, camera, W, H)).toBe(true);
    expect(hitsCheckMark(c.x + CHECK_MIN_RADIUS_PX + 2, c.y, m, camera, W, H)).toBe(false);
  });

  it('a ✓ drawn big (zoomed in) is hit across its whole disc, not beyond', () => {
    const m = mark(8);
    const r = (m.size * H) / 4 / depth(m.center); // the drawn disc's radius in px
    expect(r).toBeGreaterThan(CHECK_MIN_RADIUS_PX + 10);
    const c = screenOf(m.center);
    expect(hitsCheckMark(c.x, c.y + r - 1, m, camera, W, H)).toBe(true);
    expect(hitsCheckMark(c.x, c.y + r + 2, m, camera, W, H)).toBe(false);
  });

  it('never hits a ✓ behind the camera', () => {
    const behind = mark(2.3, new THREE.Vector3(30, 20, 30));
    expect(hitsCheckMark(400, 300, behind, camera, W, H)).toBe(false);
  });
});

describe('attachInput: the rotate button beside the ✓', () => {
  const ptr = (type: string, id: number, x: number, y: number, extra: PointerEventInit = {}) =>
    new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0, bubbles: true, ...extra });
  /** A ✓ at (5, 2, 5) and the rotate button at (3, 2, 5), and where the setup camera draws them. */
  const withMarks = () => {
    const over: Array<'check' | 'rotate' | null> = [];
    const s = setup(() => false, undefined, {
      checkMark: () => ({ center: new THREE.Vector3(5, 2, 5), size: 2.3 }),
      rotateMark: () => ({ center: new THREE.Vector3(3, 2, 5), size: 1.9 }),
      onMarkHover: (m) => over.push(m),
    });
    const on = (p: THREE.Vector3) => { const v = p.clone().project(s.camera); return { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 }; };
    return { ...s, over, check: on(new THREE.Vector3(5, 2, 5)), rot: on(new THREE.Vector3(3, 2, 5)) };
  };

  it('one tap on it turns the item once: no place, no tap on the map, no drag', () => {
    const { canvas, c, rot, dispose } = withMarks();
    canvas.dispatchEvent(ptr('pointerdown', 1, rot.x, rot.y));
    canvas.dispatchEvent(ptr('pointermove', 1, rot.x + 2, rot.y + 1)); // a finger's wobble
    window.dispatchEvent(ptr('pointerup', 1, rot.x + 2, rot.y + 1));
    expect(c.rotateGhost).toHaveBeenCalledTimes(1);
    expect(c.place).not.toHaveBeenCalled();
    expect(c.tapTile).not.toHaveBeenCalled();
    expect(c.dragGhostTo).not.toHaveBeenCalled();
    dispose();
  });

  it('a mouse over it gets the hand and darkens it; the ✓ and empty map are told apart', () => {
    const { canvas, rot, check, over, dispose } = withMarks();
    const mv = (p: { x: number; y: number }) => canvas.dispatchEvent(ptr('pointermove', 1, p.x, p.y, { pointerType: 'mouse', buttons: 0 }));
    mv(rot);
    expect(canvas.style.cursor).toBe('pointer');
    mv(check);
    mv({ x: rot.x, y: rot.y + 200 });
    expect(canvas.style.cursor).toBe('');
    expect(over).toEqual(['rotate', 'check', null]);
    dispose();
  });

  it('zoomed out, where the finger-sized hit areas overlap, the nearer centre wins', () => {
    // Both discs drawn tiny and close together: each centre is inside the other's 24 px minimum.
    const s = setup(() => false, undefined, {
      checkMark: () => ({ center: new THREE.Vector3(5, 2, 5), size: 0.2 }),
      rotateMark: () => ({ center: new THREE.Vector3(5, 2, 5.5), size: 0.2 }),
    });
    const on = (p: THREE.Vector3) => { const v = p.clone().project(s.camera); return { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 }; };
    const check = on(new THREE.Vector3(5, 2, 5));
    const rot = on(new THREE.Vector3(5, 2, 5.5));
    expect(Math.hypot(check.x - rot.x, check.y - rot.y)).toBeLessThan(CHECK_MIN_RADIUS_PX);
    const tap = (p: { x: number; y: number }) => {
      s.canvas.dispatchEvent(ptr('pointerdown', 1, p.x, p.y));
      window.dispatchEvent(ptr('pointerup', 1, p.x, p.y));
    };
    tap(rot);
    expect(s.c.rotateGhost).toHaveBeenCalledTimes(1);
    expect(s.c.place).not.toHaveBeenCalled();
    tap(check);
    expect(s.c.place).toHaveBeenCalledTimes(1);
    expect(s.c.rotateGhost).toHaveBeenCalledTimes(1);
    s.dispose();
  });

  it('a drag that starts on it moves the ghost, like one from the ✓', () => {
    const { canvas, controls, c, rot, dispose } = withMarks();
    canvas.dispatchEvent(ptr('pointerdown', 1, rot.x, rot.y));
    expect(controls.enabled).toBe(false);
    canvas.dispatchEvent(ptr('pointermove', 1, rot.x + 120, rot.y));
    window.dispatchEvent(ptr('pointerup', 1, rot.x + 120, rot.y));
    expect(c.dragGhostTo).toHaveBeenCalled();
    expect(c.rotateGhost).not.toHaveBeenCalled();
    dispose();
  });
});

describe('attachInput: tap the ✓ to place', () => {
  const ptr = (type: string, id: number, x: number, y: number, extra: PointerEventInit = {}) =>
    new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0, bubbles: true, ...extra });
  /** A ✓ at the map point (5, 2, 5) and where the setup camera draws it on the 800 x 600 canvas. */
  const withCheck = () => {
    let mark: CheckMark | null = { center: new THREE.Vector3(5, 2, 5), size: 2.3 };
    const s = setup(() => false, undefined, { checkMark: () => mark });
    const v = new THREE.Vector3(5, 2, 5).project(s.camera);
    const at = { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 };
    return { ...s, at, hide: () => { mark = null; } };
  };

  it('one tap on the ✓ places once, and neither moves nor drags the ghost', () => {
    const { canvas, c, at, dispose } = withCheck();
    canvas.dispatchEvent(ptr('pointerdown', 1, at.x, at.y));
    canvas.dispatchEvent(ptr('pointermove', 1, at.x + 2, at.y + 1)); // a finger's wobble
    window.dispatchEvent(ptr('pointerup', 1, at.x + 2, at.y + 1));
    expect(c.place).toHaveBeenCalledTimes(1);
    expect(c.tapTile).not.toHaveBeenCalled();
    expect(c.dragGhostTo).not.toHaveBeenCalled();
    dispose();
  });

  it('works with the mouse too', () => {
    const { canvas, c, at, dispose } = withCheck();
    canvas.dispatchEvent(ptr('pointerdown', 1, at.x, at.y, { pointerType: 'mouse' }));
    window.dispatchEvent(ptr('pointerup', 1, at.x, at.y, { pointerType: 'mouse' }));
    expect(c.place).toHaveBeenCalledTimes(1);
    expect(c.tapTile).not.toHaveBeenCalled();
    dispose();
  });

  it('a drag that starts on the ✓ moves the ghost (small items sit under the ✓): no place, no camera turn', () => {
    const { canvas, controls, c, at, dispose } = withCheck();
    canvas.dispatchEvent(ptr('pointerdown', 1, at.x, at.y));
    expect(controls.enabled).toBe(false); // the ghost has the gesture, not the camera
    canvas.dispatchEvent(ptr('pointermove', 1, at.x + 120, at.y));
    window.dispatchEvent(ptr('pointerup', 1, at.x + 120, at.y));
    expect(c.dragGhostTo).toHaveBeenCalled();
    expect(c.place).not.toHaveBeenCalled();
    expect(c.tapTile).not.toHaveBeenCalled();
    expect(controls.enabled).toBe(true);
    dispose();
  });

  it('the ✓ wins over the ghost body under it: a tap there places once and moves nothing', () => {
    const catalogOf = (() => ({ items: { box: { footprint: { w: 2, d: 2 } } } })) as unknown as InputOptions['catalogOf'];
    const ghostBox = () => new THREE.Box3(new THREE.Vector3(4, 0, 4), new THREE.Vector3(6, 3, 6)); // the ✓ point is inside
    const onGhostBody = (checkMark: InputOptions['checkMark']) => {
      const s = setup(() => false, undefined, { catalogOf, ghostBox, checkMark });
      Object.assign(s.state, { game: { themeId: 'school', current: 'box' }, ghost: { x: 4, z: 4, rotation: 0, valid: true } });
      const v = new THREE.Vector3(5, 2, 5).project(s.camera);
      const at = { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 };
      s.canvas.dispatchEvent(ptr('pointerdown', 1, at.x, at.y));
      const ghostDrag = !s.controls.enabled;
      window.dispatchEvent(ptr('pointerup', 1, at.x, at.y));
      s.dispose();
      return { ghostDrag, c: s.c };
    };
    const without = onGhostBody(() => null); // no ✓ there: the press grabs the ghost
    expect(without.ghostDrag).toBe(true);
    const withCheckMark = onGhostBody(() => ({ center: new THREE.Vector3(5, 2, 5), size: 2.3 }));
    expect(withCheckMark.ghostDrag).toBe(true); // a press on the ✓ holds the ghost too, so a drag can move it
    expect(withCheckMark.c.place).toHaveBeenCalledTimes(1);
    expect(withCheckMark.c.dragGhostTo).not.toHaveBeenCalled();
    expect(withCheckMark.c.tapTile).not.toHaveBeenCalled();
  });

  it('while something owns the page (a popover, the shortcuts panel) a tap on the map or on the ✓ does nothing', () => {
    let blocked = true;
    const mark: CheckMark = { center: new THREE.Vector3(5, 2, 5), size: 2.3 };
    const s = setup(() => blocked, undefined, { checkMark: () => mark });
    const v = new THREE.Vector3(5, 2, 5).project(s.camera);
    const at = { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 };
    for (const [id, p] of [[1, at], [2, { x: at.x + 150, y: at.y + 120 }]] as const) {
      s.canvas.dispatchEvent(ptr('pointerdown', id, p.x, p.y));
      window.dispatchEvent(ptr('pointerup', id, p.x, p.y));
    }
    expect(s.c.place).not.toHaveBeenCalled();
    expect(s.c.tapTile).not.toHaveBeenCalled();
    expect(s.c.dragGhostTo).not.toHaveBeenCalled();
    blocked = false; // closed: the next tap works as before
    s.canvas.dispatchEvent(ptr('pointerdown', 3, at.x, at.y));
    window.dispatchEvent(ptr('pointerup', 3, at.x, at.y));
    expect(s.c.place).toHaveBeenCalledTimes(1);
    s.dispose();
  });

  it('a tap away from the ✓ still moves the ghost; with the ✗ (no ✓) a tap there moves it too', () => {
    const { canvas, c, at, hide, dispose } = withCheck();
    canvas.dispatchEvent(ptr('pointerdown', 1, at.x + 150, at.y + 120));
    window.dispatchEvent(ptr('pointerup', 1, at.x + 150, at.y + 120));
    expect(c.tapTile).toHaveBeenCalledTimes(1);
    hide(); // the ghost turned invalid: the ✗ is not a button
    canvas.dispatchEvent(ptr('pointerdown', 2, at.x, at.y));
    window.dispatchEvent(ptr('pointerup', 2, at.x, at.y));
    expect(c.tapTile).toHaveBeenCalledTimes(2);
    expect(c.place).not.toHaveBeenCalled();
    dispose();
  });

  it('two fingers that land on the ✓ (a pinch) never place', () => {
    const { canvas, c, at, dispose } = withCheck();
    canvas.dispatchEvent(ptr('pointerdown', 1, at.x, at.y));
    canvas.dispatchEvent(ptr('pointerdown', 2, at.x + 60, at.y));
    window.dispatchEvent(ptr('pointerup', 1, at.x, at.y));
    window.dispatchEvent(ptr('pointerup', 2, at.x + 60, at.y));
    expect(c.place).not.toHaveBeenCalled();
    dispose();
  });

  it('a mouse over the ✓ gets the hand cursor and no hover preview; off it, the preview is back', () => {
    const calls: Array<{ tx: number; tz: number } | null> = [];
    const over: Array<'check' | 'rotate' | null> = [];
    let mark: CheckMark | null = { center: new THREE.Vector3(5, 2, 5), size: 2.3 };
    const s = setup(() => false, (t) => calls.push(t && { ...t }), { checkMark: () => mark, onMarkHover: (m) => over.push(m) });
    const v = new THREE.Vector3(5, 2, 5).project(s.camera);
    const at = { x: ((v.x + 1) / 2) * 800, y: ((1 - v.y) / 2) * 600 };
    const mv = (x: number, y: number) => s.canvas.dispatchEvent(ptr('pointermove', 1, x, y, { pointerType: 'mouse', buttons: 0 }));
    mv(at.x + 150, at.y + 120);
    expect(calls.at(-1)).not.toBeNull();
    expect(s.canvas.style.cursor).toBe('');
    mv(at.x, at.y);
    expect(calls.at(-1)).toBeNull();
    expect(s.canvas.style.cursor).toBe('pointer');
    mv(at.x + 150, at.y + 120);
    expect(calls.at(-1)).not.toBeNull();
    expect(s.canvas.style.cursor).toBe('');
    mv(at.x, at.y);
    mark = null; // placed: the ✓ is gone, the camera change re-checks under the still mouse
    s.controls.listeners.forEach((fn) => fn());
    expect(s.canvas.style.cursor).toBe('');
    // The ✓ is told each time the mouse moves on or off it (it darkens), and only on change.
    expect(over).toEqual(['check', null, 'check', null]);
    s.dispose();
  });

  it('the ✓ stops looking hovered when the game moves it out from under a still mouse', async () => {
    const over: Array<'check' | 'rotate' | null> = [];
    let mark: CheckMark | null = { center: new THREE.Vector3(5, 2, 5), size: 2.3 };
    const s = setup(() => false, undefined, { checkMark: () => mark, onMarkHover: (m) => over.push(m) });
    const v = new THREE.Vector3(5, 2, 5).project(s.camera);
    s.canvas.dispatchEvent(ptr('pointermove', 1, ((v.x + 1) / 2) * 800, ((1 - v.y) / 2) * 600, { pointerType: 'mouse', buttons: 0 }));
    expect(over).toEqual(['check']);
    mark = { center: new THREE.Vector3(9, 2, 1), size: 2.3 }; // an arrow key moved the ghost away
    s.emit();
    s.emit(); // many emits, one re-check
    expect(over).toEqual(['check']); // after every listener (the city view redraws the ✓ first)
    await Promise.resolve();
    expect(over).toEqual(['check', null]);
    expect(s.canvas.style.cursor).toBe('');
    s.dispose();
    expect(s.listeners.size).toBe(0);
  });

  it('the ✓ stops looking hovered when the mouse leaves the canvas', () => {
    const over: Array<'check' | 'rotate' | null> = [];
    const s = setup(() => false, undefined, { checkMark: () => ({ center: new THREE.Vector3(5, 2, 5), size: 2.3 }), onMarkHover: (m) => over.push(m) });
    const v = new THREE.Vector3(5, 2, 5).project(s.camera);
    s.canvas.dispatchEvent(ptr('pointermove', 1, ((v.x + 1) / 2) * 800, ((1 - v.y) / 2) * 600, { pointerType: 'mouse', buttons: 0 }));
    s.canvas.dispatchEvent(ptr('pointerleave', 1, 0, 0, { pointerType: 'mouse', buttons: 0 }));
    expect(over).toEqual(['check', null]);
    s.dispose();
  });
});
