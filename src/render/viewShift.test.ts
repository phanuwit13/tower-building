import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { applyViewShift, viewShiftPx } from './viewShift';

describe('viewShiftPx', () => {
  it('is half the drawer height', () => expect(viewShiftPx(300, 800)).toBe(150));
  it('is 0 without a drawer or a canvas', () => {
    expect(viewShiftPx(0, 800)).toBe(0);
    expect(viewShiftPx(300, 0)).toBe(0);
    expect(viewShiftPx(NaN, 800)).toBe(0);
  });
  it('never lifts the view by more than 40 % of the canvas', () => expect(viewShiftPx(900, 500)).toBe(200));
});

describe('applyViewShift', () => {
  const cam = () => {
    const c = new THREE.PerspectiveCamera(40, 800 / 600, 0.5, 300);
    c.position.set(16, 13, 16);
    c.lookAt(5, 0, 5);
    c.updateMatrixWorld(true);
    return c;
  };
  const screenY = (c: THREE.PerspectiveCamera, h: number): number => (1 - new THREE.Vector3(5, 0, 5).project(c).y) / 2 * h;

  it('moves the picture up by the shift and clears back to the normal view', () => {
    const c = cam();
    const y0 = screenY(c, 600);
    applyViewShift(c, 800, 600, 150);
    expect(screenY(c, 600)).toBeCloseTo(y0 - 150, 3);
    applyViewShift(c, 800, 600, 0);
    expect(c.view?.enabled ?? false).toBe(false);
    expect(screenY(c, 600)).toBeCloseTo(y0, 6);
  });

  it('follows a resize: re-applied with the new size, the shift still holds', () => {
    const c = cam();
    applyViewShift(c, 800, 600, 100);
    c.aspect = 1000 / 500;
    applyViewShift(c, 1000, 500, 100);
    expect(c.view?.fullWidth).toBe(1000);
    expect(c.view?.fullHeight).toBe(500);
    expect(c.view?.offsetY).toBe(100);
  });
});
