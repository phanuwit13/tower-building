// @vitest-environment happy-dom
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { AppState, Controller, FloorUiState } from '../app/controller';
import { attachInput, pressAction, rayHitsBox, screenArrowToGrid, strokeOnRelease } from './input';
import type { Stage } from './stage';

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

function setup(blocked: () => boolean, onHover?: (t: { tx: number; tz: number } | null) => void) {
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
  const stage = { canvas, camera, controls } as unknown as Stage;
  const floor: FloorUiState = { open: false, pick: 'wood-light', tool: 'paint', preview: null };
  const state = { screen: 'playing', game: null, ghost: null, floor } as unknown as AppState;
  const c = {
    getState: () => state,
    moveGhost: vi.fn(), rotateGhost: vi.fn(), place: vi.fn(() => true), dragGhostTo: vi.fn(), tapTile: vi.fn(),
    previewFloors: vi.fn((r: FloorUiState['preview']) => { floor.preview = r; }),
    paintFloors: vi.fn(() => { floor.preview = null; }),
  } as unknown as Controller & {
    previewFloors: ReturnType<typeof vi.fn>; paintFloors: ReturnType<typeof vi.fn>; tapTile: ReturnType<typeof vi.fn>;
  };
  const dispose = attachInput(stage, c, { isBlocked: blocked, onHover });
  return { canvas, camera, controls, c, floor, dispose };
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
