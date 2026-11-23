import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { describe, expect, it } from 'vitest';
import { GRID_SIZE } from '../game/types';
import { CAMERA, createCameraRig, distanceOfShare, TURN_MS, TURN_STEP, ZOOM_STEP, zoomShareOf } from './stage';

describe('zoom share (the slider) <-> camera distance, on a log scale', () => {
  it('0 is the farthest view, 1 the closest', () => {
    expect(distanceOfShare(0)).toBeCloseTo(CAMERA.maxDistance);
    expect(distanceOfShare(1)).toBeCloseTo(CAMERA.minDistance);
    expect(zoomShareOf(CAMERA.maxDistance)).toBeCloseTo(0);
    expect(zoomShareOf(CAMERA.minDistance)).toBeCloseTo(1);
  });
  it('round-trips, and clamps outside the limits', () => {
    for (const s of [0.1, 0.37, 0.5, 0.92]) expect(zoomShareOf(distanceOfShare(s))).toBeCloseTo(s, 9);
    expect(distanceOfShare(-1)).toBeCloseTo(CAMERA.maxDistance);
    expect(distanceOfShare(2)).toBeCloseTo(CAMERA.minDistance);
    expect(zoomShareOf(1000)).toBe(0);
    expect(zoomShareOf(0.1)).toBe(1);
  });
  it('is logarithmic: every equal step multiplies the distance by the same factor', () => {
    const r1 = distanceOfShare(0.2) / distanceOfShare(0.1);
    const r2 = distanceOfShare(0.9) / distanceOfShare(0.8);
    expect(r1).toBeCloseTo(r2, 9);
    expect(distanceOfShare(0.5)).toBeCloseTo(Math.sqrt(CAMERA.minDistance * CAMERA.maxDistance));
  });
});

function setup(reduced = false) {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.5, 300);
  const centre = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
  camera.position.copy(centre).addScaledVector(CAMERA.direction, CAMERA.distance);
  const controls = new OrbitControls(camera);
  controls.target.copy(centre);
  controls.minDistance = CAMERA.minDistance;
  controls.maxDistance = CAMERA.maxDistance;
  controls.enableDamping = true;
  controls.update();
  let now = 1000;
  const rig = createCameraRig(camera, controls, { reducedMotion: () => reduced, now: () => now });
  /** One animation frame at `t` ms: the rig steps, then the controls update (as the stage loop does). */
  const frame = (t: number) => { now = t; rig.step(t); controls.update(); };
  return { camera, controls, rig, frame, centre, at: (t: number) => { now = t; } };
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

describe('camera rig: zoom', () => {
  it('setZoom moves the camera along its line to the target; the target and the angles stay', () => {
    const { camera, controls, rig } = setup();
    const az = controls.getAzimuthalAngle();
    const polar = controls.getPolarAngle();
    const target = controls.target.clone();
    rig.setZoom(0.8);
    expect(controls.getDistance()).toBeCloseTo(distanceOfShare(0.8));
    expect(rig.zoom()).toBeCloseTo(0.8);
    expect(controls.target.equals(target)).toBe(true);
    expect(controls.getAzimuthalAngle()).toBeCloseTo(az);
    expect(controls.getPolarAngle()).toBeCloseTo(polar);
    expect(camera.position.distanceTo(target)).toBeCloseTo(distanceOfShare(0.8));
  });

  it('follows the wheel and pinch: zoom() reads whatever distance the controls left', () => {
    const { controls, rig } = setup();
    controls.dollyIn(0.6); // what a wheel notch up does: the distance times a factor under 1
    expect(rig.zoom()).toBeCloseTo(zoomShareOf(controls.getDistance()));
    expect(rig.zoom()).toBeGreaterThan(zoomShareOf(CAMERA.distance));
  });

  it('setZoom fires the controls change (the slider and the hover follow) and clamps to 0..1', () => {
    const { controls, rig } = setup();
    let changes = 0;
    controls.addEventListener('change', () => changes++);
    rig.setZoom(5);
    expect(changes).toBe(1);
    expect(controls.getDistance()).toBeCloseTo(CAMERA.minDistance);
    rig.setZoom(-3);
    expect(controls.getDistance()).toBeCloseTo(CAMERA.maxDistance);
  });

  it('zoomBy glides one step; steps pressed during the glide add up', () => {
    const { controls, rig, frame } = setup();
    const start = rig.zoom();
    rig.zoomBy(ZOOM_STEP);
    expect(rig.zoom()).toBeCloseTo(start); // nothing jumps
    frame(1050);
    expect(rig.zoom()).toBeGreaterThan(start);
    expect(rig.zoom()).toBeLessThan(start + ZOOM_STEP);
    rig.zoomBy(ZOOM_STEP); // a second press while gliding
    frame(5000);
    expect(rig.zoom()).toBeCloseTo(start + 2 * ZOOM_STEP);
    expect(controls.getDistance()).toBeCloseTo(distanceOfShare(start + 2 * ZOOM_STEP));
  });

  it('zoomBy stops at the limits', () => {
    const { rig, frame } = setup();
    for (let i = 0; i < 20; i++) rig.zoomBy(-ZOOM_STEP);
    frame(5000);
    expect(rig.zoom()).toBeCloseTo(0);
  });

  it('a zoom glide never moves the target, even with the target on the map edge (the pan clamp has nothing to undo)', () => {
    const { controls, rig, frame } = setup();
    controls.target.set(0, 0, GRID_SIZE);
    controls.update();
    const target = controls.target.clone();
    rig.zoomBy(3 * ZOOM_STEP);
    frame(1100);
    frame(5000);
    expect(controls.target.equals(target)).toBe(true);
  });
});

describe('camera rig: turn', () => {
  it('turns the view 45 degrees about the target, smoothly over TURN_MS', () => {
    const { camera, controls, rig, frame, centre } = setup();
    const az = controls.getAzimuthalAngle();
    const dist = controls.getDistance();
    const polar = controls.getPolarAngle();
    rig.turn(TURN_STEP);
    frame(1000 + TURN_MS / 2);
    const mid = wrap(controls.getAzimuthalAngle() - az);
    expect(mid).toBeGreaterThan(0.1 * TURN_STEP);
    expect(mid).toBeLessThan(0.9 * TURN_STEP);
    frame(1000 + TURN_MS);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
    expect(controls.getDistance()).toBeCloseTo(dist);
    expect(controls.getPolarAngle()).toBeCloseTo(polar);
    expect(controls.target.equals(centre)).toBe(true);
    expect(camera.position.y).toBeCloseTo(centre.y + dist * Math.cos(polar));
    frame(3000); // done: nothing more
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
  });

  it('settle() finishes a turn and a zoom glide on their exact end', () => {
    const { controls, rig, frame } = setup();
    const az = controls.getAzimuthalAngle();
    const d = controls.getDistance();
    rig.turn(TURN_STEP);
    rig.zoomBy(ZOOM_STEP);
    frame(1000 + 50);
    rig.settle();
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
    expect(controls.getDistance()).toBeLessThan(d);
    const after = controls.getDistance();
    frame(5000); // nothing is left to glide
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
    expect(controls.getDistance()).toBeCloseTo(after, 6);
  });

  it('turns the other way with a negative angle, and presses during a turn queue up', () => {
    const { controls, rig, frame } = setup();
    const az = controls.getAzimuthalAngle();
    rig.turn(-TURN_STEP);
    frame(1000 + TURN_MS / 3);
    rig.turn(-TURN_STEP);
    frame(10_000);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(-2 * TURN_STEP, 6);
  });

  it('reduced motion: the turn and the zoom step happen at once', () => {
    const { controls, rig } = setup(true);
    const az = controls.getAzimuthalAngle();
    const zoom = rig.zoom();
    rig.turn(TURN_STEP);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
    rig.zoomBy(ZOOM_STEP);
    expect(rig.zoom()).toBeCloseTo(zoom + ZOOM_STEP);
  });

  it('a hand on the map (controls start: a press, the wheel, a pinch) finishes a turn on its 45 degree step', () => {
    const { controls, rig, frame } = setup();
    const az = controls.getAzimuthalAngle();
    rig.turn(TURN_STEP);
    frame(1000 + TURN_MS / 2);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeLessThan(TURN_STEP);
    controls.dispatchEvent({ type: 'start' });
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
    frame(10_000);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
  });

  it('a frame stamped a little before the press (rAF time) does not turn backwards', () => {
    const { controls, rig, frame, at } = setup();
    const az = controls.getAzimuthalAngle();
    at(2000);
    rig.turn(TURN_STEP);
    frame(1990);
    expect(controls.getAzimuthalAngle()).toBeCloseTo(az, 9);
    frame(2000 + TURN_MS);
    expect(wrap(controls.getAzimuthalAngle() - az)).toBeCloseTo(TURN_STEP, 6);
  });
});
