import * as THREE from 'three';
import { afterEach, describe, expect, it } from 'vitest';
import {
  advanceMotion, BLINK_OFF_LEVEL, BLINK_PERIOD, CULL_MARGIN, freezeMotion, LIGHT_CODE, LIGHT_MAX_HZ, LIGHT_STRIDE, lightPattern, packLight, MOTION_CODE, MOTION_FRAGMENT_PARS, MOTION_VERTEX_APPLY, MOTION_VERTEX_PARS,
  MOTION_VERTEX_REST, MOTION_VERTEX_SETUP, motionUniforms, patchMotionShader, resolveMotion, setNight,
  setReducedMotion, setWind, watchReducedMotion,
} from './motion';

const reset = () => {
  motionUniforms.uTime.value = 0;
  setWind(1);
  setNight(0);
  setReducedMotion(false);
};
afterEach(reset);

describe('motion codes', () => {
  it('gives every kind its own code; 0 is static, water splits into pond and pool', () => {
    expect(MOTION_CODE).toEqual({ none: 0, sway: 1, wave: 2, spin: 3, swing: 4, pond: 5, pool: 6 });
  });
});

describe('resolveMotion', () => {
  const at: [number, number, number] = [0.2, 1, -0.1];
  it('fills the defaults: sway bends from the base of the part (lowest y), straight up', () => {
    const m = resolveMotion({ kind: 'sway' }, at, 0.4);
    expect(m.anim[0]).toBe(MOTION_CODE.sway);
    expect(m.anim[1]).toBeGreaterThan(0);
    expect(m.anim[2]).toBeGreaterThan(0);
    expect(m.anim[3]).toBe(0);
    expect(m.pivot).toEqual([0.2, 0.4, -0.1]);
    expect(m.axis).toEqual([0, 1, 0]);
  });
  it('spin turns about the part centre on the vertical; swing about x; wave runs along +x', () => {
    expect(resolveMotion({ kind: 'spin' }, at, 0)).toMatchObject({ pivot: at, axis: [0, 1, 0] });
    expect(resolveMotion({ kind: 'swing' }, at, 0)).toMatchObject({ pivot: at, axis: [1, 0, 0] });
    expect(resolveMotion({ kind: 'wave' }, at, 0)).toMatchObject({ pivot: at, axis: [1, 0, 0] });
  });
  it('keeps explicit values and normalises the axis', () => {
    const m = resolveMotion({ kind: 'swing', pivot: [0, 2, 0], axis: [0, 0, 3], amount: 0.5, speed: 3, phase: 1 }, at, 0);
    expect(m.anim).toEqual([MOTION_CODE.swing, 0.5, 3, 1]);
    expect(m.pivot).toEqual([0, 2, 0]);
    expect(m.axis).toEqual([0, 0, 1]);
  });
  it('water is a pond unless it says pool', () => {
    expect(resolveMotion({ kind: 'water' }, at, 0).anim[0]).toBe(MOTION_CODE.pond);
    expect(resolveMotion({ kind: 'water', water: 'pond' }, at, 0).anim[0]).toBe(MOTION_CODE.pond);
    expect(resolveMotion({ kind: 'water', water: 'pool' }, at, 0).anim[0]).toBe(MOTION_CODE.pool);
  });
  it('rejects an unknown kind, a zero or non-finite axis, non-finite numbers and an upright flag', () => {
    expect(() => resolveMotion({ kind: 'jiggle' as never }, at, 0)).toThrow(/motion kind/);
    expect(() => resolveMotion({ kind: 'spin', axis: [0, 0, 0] }, at, 0)).toThrow(/axis/);
    expect(() => resolveMotion({ kind: 'spin', axis: [NaN, 1, 0] }, at, 0)).toThrow(/axis/);
    expect(() => resolveMotion({ kind: 'spin', pivot: [0, Infinity, 0] }, at, 0)).toThrow(/pivot/);
    expect(() => resolveMotion({ kind: 'sway', amount: NaN }, at, 0)).toThrow(/amount/);
    expect(() => resolveMotion({ kind: 'sway', speed: Infinity }, at, 0)).toThrow(/speed/);
    expect(() => resolveMotion({ kind: 'wave', axis: [0, 1, 0] }, at, 0)).toThrow(/wave/);
  });
});

describe('motion uniforms', () => {
  it('start calm: time 0, wind 1, motion on, day', () => {
    expect(motionUniforms.uTime.value).toBe(0);
    expect(motionUniforms.uWind.value).toBe(1);
    expect(motionUniforms.uMotion.value).toBe(1);
    expect(motionUniforms.uNight.value).toBe(0);
  });
  it('advanceMotion adds frame time in seconds and ignores bad frames', () => {
    advanceMotion(500);
    advanceMotion(250);
    expect(motionUniforms.uTime.value).toBeCloseTo(0.75);
    advanceMotion(-10);
    advanceMotion(NaN);
    expect(motionUniforms.uTime.value).toBeCloseTo(0.75);
  });
  it('setWind, setNight and setReducedMotion set their uniform, clamped', () => {
    setWind(1.8);
    expect(motionUniforms.uWind.value).toBe(1.8);
    setWind(-1);
    expect(motionUniforms.uWind.value).toBe(0);
    setNight(0.6);
    expect(motionUniforms.uNight.value).toBe(0.6);
    setNight(3);
    expect(motionUniforms.uNight.value).toBe(1);
    setReducedMotion(true);
    expect(motionUniforms.uMotion.value).toBe(0);
    setReducedMotion(false);
    expect(motionUniforms.uMotion.value).toBe(1);
  });
  it('freezeMotion holds time 0 and motion off until restored', () => {
    advanceMotion(1234);
    setReducedMotion(false);
    const restore = freezeMotion();
    expect(motionUniforms.uTime.value).toBe(0);
    expect(motionUniforms.uMotion.value).toBe(0);
    restore();
    expect(motionUniforms.uTime.value).toBeCloseTo(1.234);
    expect(motionUniforms.uMotion.value).toBe(1);
  });
});

describe('watchReducedMotion', () => {
  function fakeMedia(matches: boolean) {
    const listeners = new Set<(e: { matches: boolean }) => void>();
    const mql = {
      matches,
      addEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.add(l),
      removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.delete(l),
    };
    const queries: string[] = [];
    const matchMedia = (q: string) => { queries.push(q); return mql; };
    return { matchMedia, queries, change: (m: boolean) => { mql.matches = m; for (const l of listeners) l({ matches: m }); }, listeners };
  }
  it('turns motion off for prefers-reduced-motion: reduce, and follows live changes until stopped', () => {
    const media = fakeMedia(true);
    const stop = watchReducedMotion(media.matchMedia as never);
    expect(media.queries).toEqual(['(prefers-reduced-motion: reduce)']);
    expect(motionUniforms.uMotion.value).toBe(0);
    media.change(false);
    expect(motionUniforms.uMotion.value).toBe(1);
    media.change(true);
    expect(motionUniforms.uMotion.value).toBe(0);
    stop();
    expect(media.listeners.size).toBe(0);
  });
  it('does nothing without matchMedia', () => {
    expect(() => watchReducedMotion(undefined)()).not.toThrow();
    expect(motionUniforms.uMotion.value).toBe(1);
  });
});

describe('motion shader', () => {
  const standard = () => ({
    uniforms: {} as Record<string, THREE.IUniform>,
    vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: THREE.ShaderLib.standard.fragmentShader,
  });

  it('declares the attributes, the shared uniforms and the fragment flag', () => {
    for (const s of ['attribute vec4 anim;', 'attribute vec3 pivot;', 'attribute vec3 axis;', 'uniform float uTime;',
      'uniform float uWind;', 'uniform float uMotion;', 'uniform float uNight;', 'varying vec4 vAnim;']) {
      expect(MOTION_VERTEX_PARS).toContain(s);
    }
    expect(MOTION_FRAGMENT_PARS).toContain('varying vec4 vAnim;');
  });

  it('has a branch per moving kind, turns the normal with spin/swing, and restores the rest pose for shadows', () => {
    for (const code of [MOTION_CODE.sway, MOTION_CODE.wave, MOTION_CODE.spin, MOTION_CODE.swing]) {
      expect(MOTION_VERTEX_SETUP).toContain(`motionKind == ${code}`);
    }
    expect(MOTION_VERTEX_SETUP).toContain('objectNormal = motionRot * objectNormal');
    expect(MOTION_VERTEX_SETUP).toContain('uMotion');
    expect(MOTION_VERTEX_APPLY).toContain('transformed = pivot + motionRot * ( transformed - pivot ) + motionShift');
    expect(MOTION_VERTEX_REST).toContain('transformed = motionRest');
  });

  it('patches a standard shader in order: setup after the normal, move before projecting, rest before the shadow lookup', () => {
    const s = standard();
    patchMotionShader(s);
    const v = s.vertexShader;
    const at = (needle: string) => {
      const i = v.indexOf(needle);
      expect(i, needle).toBeGreaterThanOrEqual(0);
      return i;
    };
    expect(at('attribute vec4 anim;')).toBeLessThan(at('void main()'));
    expect(at('#include <beginnormal_vertex>')).toBeLessThan(at('int motionKind'));
    expect(at('int motionKind')).toBeLessThan(at('#include <defaultnormal_vertex>'));
    expect(at('#include <begin_vertex>')).toBeLessThan(at('vec3 motionRest'));
    expect(at('vec3 motionRest')).toBeLessThan(at('#include <project_vertex>'));
    expect(at('#include <project_vertex>')).toBeLessThan(at('transformed = motionRest'));
    expect(at('transformed = motionRest')).toBeLessThan(at('#include <worldpos_vertex>'));
    expect(s.fragmentShader.indexOf('varying vec4 vAnim;')).toBeLessThan(s.fragmentShader.indexOf('void main()'));
  });

  it('shares the one uniform object, so a frame update reaches every material', () => {
    const a = standard();
    const b = standard();
    patchMotionShader(a);
    patchMotionShader(b);
    for (const k of ['uTime', 'uWind', 'uMotion', 'uNight'] as const) {
      expect(a.uniforms[k]).toBe(motionUniforms[k]);
      expect(b.uniforms[k]).toBe(motionUniforms[k]);
    }
  });

  it('fails loudly when three renames a chunk it hooks into', () => {
    const s = standard();
    s.vertexShader = s.vertexShader.replace('#include <worldpos_vertex>', '');
    expect(() => patchMotionShader(s)).toThrow(/worldpos_vertex/);
  });

  it('chunk meshes get a culling margin for sway', () => {
    expect(CULL_MARGIN).toBe(0.3);
  });
});

describe('light patterns', () => {
  const sample = (kind: 'breathe' | 'blink' | 'window', phase = 0.7, seconds = 30, hz = 200) =>
    Array.from({ length: seconds * hz }, (_, i) => lightPattern(kind, i / hz, phase));

  it('steady and reduced motion hold exactly 1.0', () => {
    expect(lightPattern('steady', 12.3, 1)).toBe(1);
    for (const k of ['breathe', 'blink', 'window'] as const) expect(lightPattern(k, 12.3, 1, 0)).toBe(1);
  });
  it('breathe stays within 0.65..1.0 and reaches both ends', () => {
    const v = sample('breathe');
    expect(Math.min(...v)).toBeGreaterThanOrEqual(0.65 - 1e-9);
    expect(Math.max(...v)).toBeLessThanOrEqual(1 + 1e-9);
    expect(Math.min(...v)).toBeLessThan(0.66);
    expect(Math.max(...v)).toBeGreaterThan(0.99);
  });
  it('blink is on or dim, and each phase offset shifts it', () => {
    const v = sample('blink');
    expect(new Set(v)).toEqual(new Set([1, BLINK_OFF_LEVEL]));
    expect(lightPattern('blink', 0, 0)).not.toBe(lightPattern('blink', 0, Math.PI * 1.2));
  });
  it('window varies each pane by at most 15 % and is constant over time', () => {
    for (const phase of [0, 1, 2.5, 4, 6, 9.1]) {
      const v = sample('window', phase, 2);
      expect(new Set(v).size).toBe(1);
      expect(Math.abs(v[0] - 1)).toBeLessThanOrEqual(0.15 + 1e-9);
    }
    const spread = [0.1, 1.3, 2.9, 4.4, 5.9].map((p) => lightPattern('window', 0, p));
    expect(Math.max(...spread) - Math.min(...spread)).toBeGreaterThan(0.1);
  });
  it('no pattern changes faster than 3 Hz (direction reversals or on/off flips per second)', () => {
    for (const kind of ['breathe', 'blink', 'window'] as const) {
      const v = sample(kind, 0.3, 60);
      let turns = 0;
      let dir = 0;
      for (let i = 1; i < v.length; i++) {
        const d = Math.sign(v[i] - v[i - 1]);
        if (d !== 0 && d !== dir) { if (dir !== 0) turns++; dir = d; }
      }
      expect(turns / 60).toBeLessThanOrEqual(LIGHT_MAX_HZ);
    }
    expect(1 / BLINK_PERIOD).toBeLessThanOrEqual(1);
    expect(2 / BLINK_PERIOD).toBeLessThanOrEqual(LIGHT_MAX_HZ);
  });
  it('packs beside the motion code and the shader decodes and uses it', () => {
    expect(packLight(MOTION_CODE.swing, 'blink')).toBe(MOTION_CODE.swing + LIGHT_STRIDE * LIGHT_CODE.blink);
    expect(() => packLight(0, 'flash' as never)).toThrow(/unknown light/);
    expect(MOTION_VERTEX_SETUP).toContain('vLight');
    expect(MOTION_FRAGMENT_PARS).toContain('varying float vLight');
  });
});
