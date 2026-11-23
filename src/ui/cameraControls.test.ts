// @vitest-environment happy-dom
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { describe, expect, it, vi } from 'vitest';
import { memoryStore } from '../app/browserStore';
import { seenHints } from '../app/hints';
import { GRID_SIZE } from '../game/types';
import { CAMERA, createCameraRig, TURN_STEP, ZOOM_STEP, zoomShareOf } from '../render/stage';
import { createCameraControls, TURNED_RAD } from './cameraControls';
import { T } from './strings';

function setup(opts: { seen?: string } = {}) {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.5, 300);
  const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
  camera.position.copy(centre).addScaledVector(CAMERA.direction, CAMERA.distance);
  const controls = new OrbitControls(camera);
  controls.target.copy(centre);
  controls.minDistance = CAMERA.minDistance;
  controls.maxDistance = CAMERA.maxDistance;
  controls.update();
  const rig = createCameraRig(camera, controls, { reducedMotion: () => true }); // instant moves
  const spy = { turn: vi.spyOn(rig, 'turn'), zoomBy: vi.spyOn(rig, 'zoomBy'), setZoom: vi.spyOn(rig, 'setZoom') };
  const store = memoryStore(opts.seen ? { 'city-builder/seen': opts.seen } : {});
  const seen = seenHints(store);
  const root = document.createElement('div');
  document.body.appendChild(root);
  const view = createCameraControls(root, { controls, rig }, seen);
  view.update({ visible: true });
  const button = (name: string) => root.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
  const slider = root.querySelector<HTMLInputElement>('input[type="range"]')!;
  const box = root.firstElementChild as HTMLElement;
  const hint = () => [...root.querySelectorAll<HTMLElement>('*')].find((e) => e.textContent === T.camera.dragHint && e.children.length === 0);
  const turnButtons = () => [button(T.camera.turnLeft), button(T.camera.turnRight)];
  /** The drag hint is on screen (in the DOM, not hidden itself or by an ancestor) and the turn buttons pulse. */
  const hintShown = () => {
    const h = hint();
    return !!h && !h.closest('[hidden]') && turnButtons().every((b) => b.classList.contains('pulse'));
  };
  return { root, box, controls, camera, rig, spy, store, seen, view, button, slider, hint, hintShown, turnButtons };
}

describe('camera controls: buttons and slider', () => {
  it('has ＋, the zoom slider, －, ⟲ and ⟳, each named in Thai and at least a button', () => {
    const { button, slider } = setup();
    for (const name of [T.camera.zoomIn, T.camera.zoomOut, T.camera.turnLeft, T.camera.turnRight]) {
      const b = button(name);
      expect(b, name).toBeTruthy();
      expect(b.type).toBe('button');
      expect(b.title).toContain(name); // a mouse shows the name on hover
    }
    expect(slider.getAttribute('aria-label')).toBe(T.camera.zoom);
    expect(slider.min).toBe('0');
    expect(slider.max).toBe('100');
  });

  it('＋ / － zoom a step, ⟲ / ⟳ turn 45 degrees (⟲ like Q, ⟳ like E)', () => {
    const { button, spy } = setup();
    button(T.camera.zoomIn).click();
    button(T.camera.zoomOut).click();
    expect(spy.zoomBy.mock.calls).toEqual([[ZOOM_STEP], [-ZOOM_STEP]]);
    button(T.camera.turnLeft).click();
    button(T.camera.turnRight).click();
    expect(spy.turn.mock.calls).toEqual([[-TURN_STEP], [TURN_STEP]]);
  });

  it('the slider sets the zoom; the top end is the closest view', () => {
    const { slider, spy, controls } = setup();
    slider.value = '100';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(spy.setZoom).toHaveBeenLastCalledWith(1);
    expect(controls.getDistance()).toBeCloseTo(CAMERA.minDistance);
    slider.value = '25';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(spy.setZoom).toHaveBeenLastCalledWith(0.25);
  });

  it('starts at the camera\'s zoom and follows the wheel and pinch', () => {
    const { slider, controls } = setup();
    expect(Number(slider.value)).toBe(Math.round(zoomShareOf(CAMERA.distance) * 100));
    controls.dollyIn(0.5); // a pinch in: half the distance
    expect(Number(slider.value)).toBe(Math.round(zoomShareOf(controls.getDistance()) * 100));
    expect(Number(slider.value)).toBeGreaterThan(Math.round(zoomShareOf(CAMERA.distance) * 100));
  });

  it('exposes the camera azimuth (degrees) and distance for checks', () => {
    const { box, rig } = setup();
    expect(Number(box.dataset.distance)).toBeCloseTo(CAMERA.distance, 1);
    expect(Number(box.dataset.azimuth)).toBeCloseTo(45, 0);
    rig.turn(TURN_STEP);
    expect(Number(box.dataset.azimuth)).toBeCloseTo(90, 0);
  });

  it('hides with the HUD', () => {
    const { box, view } = setup();
    expect(box.hidden).toBe(false);
    view.update({ visible: false });
    expect(box.hidden).toBe(true);
    view.update({ visible: true });
    expect(box.hidden).toBe(false);
  });
});

describe('camera controls: the first-visit turn hint', () => {
  it('on a first visit the turn buttons pulse with "ลากเพื่อหมุนมุมกล้อง" beside them', () => {
    const { hintShown, hint } = setup();
    expect(hint()).toBeTruthy();
    expect(hintShown()).toBe(true);
  });

  it('goes after the first turn by a button, and is remembered', () => {
    const { button, hintShown, store } = setup();
    button(T.camera.turnRight).click();
    expect(hintShown()).toBe(false);
    expect(seenHints(store).has('turned')).toBe(true);
  });

  it('goes after a drag that turns the view (or tilts it), but not after a tap\'s wobble, a zoom or a pan', () => {
    const wobble = setup();
    wobble.controls.rotateLeft(TURNED_RAD / 3);
    wobble.rig.setZoom(0.9);
    wobble.controls.target.x += 2; // a pan slides the target and the camera together
    wobble.camera.position.x += 2;
    wobble.controls.update();
    expect(wobble.hintShown()).toBe(true);
    wobble.controls.rotateLeft(TURNED_RAD);
    expect(wobble.hintShown()).toBe(false);

    const tilt = setup();
    tilt.controls.rotateUp(TURNED_RAD * 1.2);
    expect(tilt.hintShown()).toBe(false);
  });

  it('never shows again once seen (a later visit)', () => {
    const { hint, hintShown, turnButtons } = setup({ seen: 'turned' });
    expect(hintShown()).toBe(false);
    expect(hint()?.closest('[hidden]') ?? null).not.toBeNull();
    for (const b of turnButtons()) expect(b.classList.contains('pulse')).toBe(false);
  });

  it('turning back to where it started does not bring it back', () => {
    const { controls, hintShown } = setup();
    controls.rotateLeft(1);
    controls.rotateLeft(-1);
    expect(hintShown()).toBe(false);
  });
});
