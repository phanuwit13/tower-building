import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { applyViewShift, createShiftGlide, SHIFT_GLIDE_MS, viewShiftPx } from './viewShift';

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

describe('createShiftGlide', () => {
  it('glides to the target over SHIFT_GLIDE_MS instead of jumping, then holds it', () => {
    const g = createShiftGlide();
    g.to(80, 1000);
    expect(g.at(1000)).toBe(0); // the drawer has only just started to slide
    const mid = g.at(1000 + SHIFT_GLIDE_MS / 2);
    expect(mid).toBeGreaterThan(40); // ease-out: past half way at half time
    expect(mid).toBeLessThan(80);
    expect(g.at(1000 + SHIFT_GLIDE_MS)).toBe(80);
    expect(g.at(5000)).toBe(80);
  });
  it('turning back mid-glide starts from where the view is, not from the end', () => {
    const g = createShiftGlide();
    g.to(80, 0);
    const there = g.at(SHIFT_GLIDE_MS / 2);
    g.to(0, SHIFT_GLIDE_MS / 2);
    expect(g.at(SHIFT_GLIDE_MS / 2)).toBe(there);
    expect(g.at(SHIFT_GLIDE_MS * 1.5)).toBe(0);
  });
  it('the same target again does not restart the glide', () => {
    const g = createShiftGlide();
    g.to(80, 0);
    g.at(SHIFT_GLIDE_MS / 2);
    g.to(80, SHIFT_GLIDE_MS / 2);
    expect(g.at(SHIFT_GLIDE_MS)).toBe(80);
  });
  it('instant (reduced motion) jumps straight to the target', () => {
    const g = createShiftGlide();
    g.to(80, 0, true);
    expect(g.at(0)).toBe(80);
    g.to(0, 10, true);
    expect(g.at(10)).toBe(0);
  });
});
