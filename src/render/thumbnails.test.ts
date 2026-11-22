import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { getStyleKit } from '../models/kit';
import { advanceMotion, motionUniforms } from '../models/motion';
import type { ItemModel } from '../models/contract';
import { createThumbnailer, type ThumbGl } from './thumbnails';

const kit = getStyleKit();
const item = (id: string, build?: ItemModel['build']): ItemModel => ({
  id, name: id, category: 'decoration', footprint: { w: 1, d: 1 },
  build: build ?? ((k) => k.finish([k.box([0.5, 0.5, 0.5], [0, 0.25, 0], 'cream')])),
});

function fakeGl(onRender?: () => void): ThumbGl & { renders: number } {
  const gl = {
    renders: 0,
    renderer: {
      render: () => { gl.renders++; onRender?.(); },
      domElement: { toDataURL: () => `data:image/png;base64,${gl.renders}` },
    },
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(),
  };
  return gl;
}

describe('thumbnailer', () => {
  it('caches per ItemModel object, not per id', () => {
    const gl = fakeGl();
    const t = createThumbnailer(kit, () => gl);
    const a = item('same');
    const b = item('same'); // another theme reusing the id
    const ua = t.get(a);
    expect(t.get(a)).toBe(ua);
    expect(gl.renders).toBe(1);
    expect(t.get(b)).not.toBe(ua);
    expect(gl.renders).toBe(2);
  });

  it('renders with glow off and restores the previous strength', () => {
    kit.setGlowStrength(0.8);
    let seen = -1;
    const gl = fakeGl(() => { seen = kit.getGlowStrength(); });
    createThumbnailer(kit, () => gl).get(item('lamp'));
    expect(seen).toBe(0);
    expect(kit.getGlowStrength()).toBe(0.8);
    kit.setGlowStrength(0);
  });

  it('renders with motion frozen (time 0, motion off) and restores the shared clock', () => {
    advanceMotion(5000);
    let seen = { time: -1, motion: -1 };
    const gl = fakeGl(() => { seen = { time: motionUniforms.uTime.value, motion: motionUniforms.uMotion.value }; });
    createThumbnailer(kit, () => gl).get(item('swing'));
    expect(seen).toEqual({ time: 0, motion: 0 });
    expect(motionUniforms.uTime.value).toBeCloseTo(5);
    expect(motionUniforms.uMotion.value).toBe(1);
    // a throwing render restores it too
    const bad = fakeGl(() => { throw new Error('context lost'); });
    createThumbnailer(kit, () => bad).get(item('y'));
    expect(motionUniforms.uTime.value).toBeCloseTo(5);
    expect(motionUniforms.uMotion.value).toBe(1);
    motionUniforms.uTime.value = 0;
  });

  it('one failing item returns "" once and does not disable the others; scene is cleaned', () => {
    const gl = fakeGl();
    const t = createThumbnailer(kit, () => gl);
    const bad = vi.fn(() => { throw new Error('broken model'); });
    const badItem = item('bad', bad);
    expect(t.get(badItem)).toBe('');
    expect(t.get(badItem)).toBe('');
    expect(bad).toHaveBeenCalledTimes(1);
    expect(t.get(item('good'))).toMatch(/^data:image\/png/);
    expect(gl.scene.children.filter((c) => (c as THREE.Mesh).isMesh || c.type === 'Group')).toHaveLength(0);
  });

  it('a throw after the model was added still removes it and restores glow', () => {
    kit.setGlowStrength(0.5);
    const gl = fakeGl(() => { throw new Error('context lost'); });
    const t = createThumbnailer(kit, () => gl);
    expect(t.get(item('x'))).toBe('');
    expect(gl.scene.children).toHaveLength(0);
    expect(kit.getGlowStrength()).toBe(0.5);
    kit.setGlowStrength(0);
  });

  it('WebGL init failure disables thumbnails and is tried only once', () => {
    const make = vi.fn((): ThumbGl => { throw new Error('no webgl'); });
    const t = createThumbnailer(kit, make);
    expect(t.get(item('a'))).toBe('');
    expect(t.get(item('b'))).toBe('');
    expect(make).toHaveBeenCalledTimes(1);
  });
});
