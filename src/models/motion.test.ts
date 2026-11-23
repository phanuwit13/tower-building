import * as THREE from 'three';
import { afterEach, describe, expect, it } from 'vitest';
import type { Vec3 } from './kit';
import {
  ANIM_STEP, MOTION_ATTRIBUTES, MOTION_LIMITS, packAnim, packAxis, unpackAnim,
  advanceMotion, BLINK_OFF_LEVEL, BREATHE_AMP, BREATHE_MID, BREATHE_MIN, TAU, snapWind, WIND_EASE_SECONDS, BLINK_ON, BLINK_PERIOD, BREATHE_PERIOD, WINDOW_VARIATION, freezeMotion, glslFloat, LIGHT_CODE, LIGHT_MAX_HZ, LIGHT_STRIDE, lightPattern, packLight, MOTION_CODE, MOTION_FRAGMENT_PARS, MOTION_VERTEX_APPLY, MOTION_VERTEX_PARS,
  MOTION_VERTEX_REST, MOTION_VERTEX_SETUP, motionUniforms, patchMotionShader, patchWaterShader, resolveMotion, setMoon, setNight,
  setReducedMotion, setWind, WATER, WATER_FRAGMENT, WATER_FRAGMENT_PARS, waterLight, watchReducedMotion,
  CHASE_LIGHT_GLSL, CHASE_LIT_SHARE, CHASE_MAX_COUNT, CHASE_OFF_LEVEL, CHASE_STEP_HZ, chaseRunLength, packChase, unpackChase,
} from './motion';

const reset = () => {
  motionUniforms.uTime.value = 0;
  snapWind(1);
  setNight(0);
  setMoon(0);
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
  it('rejects an amount, speed or phase outside what the packed attribute holds; the limits themselves pass', () => {
    const { amount, speed, phase } = MOTION_LIMITS;
    expect(() => resolveMotion({ kind: 'swing', amount, speed: -speed, phase }, at, 0)).not.toThrow();
    expect(() => resolveMotion({ kind: 'swing', amount: -amount, speed, phase: -phase }, at, 0)).not.toThrow();
    expect(() => resolveMotion({ kind: 'sway', amount: amount + 0.01 }, at, 0)).toThrow(/style kit: motion amount.*±4/);
    expect(() => resolveMotion({ kind: 'spin', speed: -speed - 0.01 }, at, 0)).toThrow(/style kit: motion speed.*±16/);
    expect(() => resolveMotion({ kind: 'spin', phase: phase + 0.01 }, at, 0)).toThrow(/style kit: motion phase.*±16/);
  });
});

describe('packed motion attributes', () => {
  it('fit in 24 bytes a vertex (was 40 as floats), every stride a multiple of 4 (no realignment on Metal)', () => {
    let bytes = 0;
    for (const f of Object.values(MOTION_ATTRIBUTES)) {
      const stride = f.array.BYTES_PER_ELEMENT * f.itemSize;
      expect(stride % 4).toBe(0);
      bytes += stride;
    }
    expect(bytes).toBeLessThanOrEqual(24);
    expect(Object.keys(MOTION_ATTRIBUTES)).toEqual(['anim', 'pivot', 'axis']);
  });
  it('anim keeps the code exact and amount, speed and phase within half a step, out to the limits', () => {
    const half = (i: number) => ANIM_STEP[i] / 2 + 1e-12;
    const { amount, speed, phase } = MOTION_LIMITS;
    const cases = [
      [0, 0, 0, 0],
      [MOTION_CODE.swing + LIGHT_STRIDE * LIGHT_CODE.window, amount, -speed, phase + TAU - 1e-6], // a window pane's hash rides on the phase
      [MOTION_CODE.pool, -amount, speed, -phase],
      [MOTION_CODE.sway, 0.05, 1.7, 0.123456],
      [MOTION_CODE.spin, 1, 0.4, TAU * 0.999],
    ];
    for (const v of cases) {
      const packed = packAnim(v);
      for (const p of packed) expect(Number.isInteger(p) && p >= -32768 && p <= 32767, String(v)).toBe(true);
      const back = unpackAnim(packed);
      expect(back[0]).toBe(v[0]);
      for (let i = 1; i < 4; i++) expect(Math.abs(back[i] - v[i]), `${v} [${i}]`).toBeLessThanOrEqual(half(i));
    }
    // tolerances in words: amount 0.00013 (a 1-unit crown at 0.05 leans 0.1 mm off), speed and phase 0.0005 rad
    expect(ANIM_STEP).toEqual([1, 2 ** -12, 2 ** -10, 2 ** -10]);
  });
  it('anim refuses values it cannot hold rather than wrapping them', () => {
    expect(() => packAnim([0, 9, 0, 0])).toThrow(/packed/);
    expect(() => packAnim([0, 0, 0, 40])).toThrow(/packed/);
    expect(() => packAnim([0.5, 0, 0, 0])).toThrow(/whole/);
  });
  it('a unit axis comes back within 0.4° (exactly for the axis directions); a second packing (a merge) stays within 0.8°', () => {
    const angle = (a: Vec3, b: Vec3) => Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])) * (180 / Math.PI);
    const unit = (v: Vec3): Vec3 => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; };
    const back = (v: Vec3) => unit(packAxis(v).slice(0, 3).map((c) => c / 127) as Vec3);
    for (const v of [[1, 0, 0], [0, 1, 0], [0, 0, -1], [-1, 0, 0]] as Vec3[]) expect(back(v)).toEqual(v.map((c) => c + 0));
    let once = 0;
    let twice = 0;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
    for (let i = 0; i < 5000; i++) {
      const v = unit([rnd(), rnd(), rnd()]);
      once = Math.max(once, angle(v, back(v)));
      twice = Math.max(twice, angle(v, back(back(v)))); // a merge reads the bytes, re-normalises, packs again
    }
    expect(once).toBeLessThan(0.4);
    expect(twice).toBeLessThan(0.8);
    expect(packAxis([0, 0, 0])).toEqual([0, 0, 0, 0]);
  });
});

describe('motion uniforms', () => {
  it('start calm: time 0, wind 1, motion on, day, no moon', () => {
    expect(motionUniforms.uTime.value).toBe(0);
    expect(motionUniforms.uWind.value).toBe(1);
    expect(motionUniforms.uMotion.value).toBe(1);
    expect(motionUniforms.uNight.value).toBe(0);
    expect(motionUniforms.uMoon.value).toBe(0);
  });
  it('advanceMotion adds frame time in seconds and ignores bad frames', () => {
    advanceMotion(500);
    advanceMotion(250);
    expect(motionUniforms.uTime.value).toBeCloseTo(0.75);
    advanceMotion(-10);
    advanceMotion(NaN);
    expect(motionUniforms.uTime.value).toBeCloseTo(0.75);
  });
  it('setNight and setReducedMotion set their uniform, clamped', () => {
    setNight(0.6);
    expect(motionUniforms.uNight.value).toBe(0.6);
    setNight(3);
    expect(motionUniforms.uNight.value).toBe(1);
    setReducedMotion(true);
    expect(motionUniforms.uMotion.value).toBe(0);
    setReducedMotion(false);
    expect(motionUniforms.uMotion.value).toBe(1);
    setMoon(0.35);
    expect(motionUniforms.uMoon.value).toBe(0.35);
    setMoon(-2);
    expect(motionUniforms.uMoon.value).toBe(0);
    setMoon(9);
    expect(motionUniforms.uMoon.value).toBe(1);
  });
  it('setWind sets a target (clamped); the uniform only moves when time advances', () => {
    setWind(1.8);
    expect(motionUniforms.uWind.value).toBe(1);
    snapWind(9);
    expect(motionUniforms.uWind.value).toBe(4);
    snapWind(-1);
    expect(motionUniforms.uWind.value).toBe(0);
  });
  it('the wind eases to its target: a gentle first step, within 1 % after 1.5 s, never overshooting', () => {
    setWind(1.8);
    advanceMotion(16);
    expect(motionUniforms.uWind.value).toBeGreaterThan(1);
    expect(motionUniforms.uWind.value).toBeLessThan(1.1); // a crown moves only a little this frame
    for (let i = 0; i < 90; i++) advanceMotion(16); // 1.5 s in all
    expect(Math.abs(motionUniforms.uWind.value - 1.8)).toBeLessThan(0.018);
    snapWind(1);
    setWind(1.8);
    advanceMotion(100);
    expect(motionUniforms.uWind.value).toBeLessThan(1.8);
    advanceMotion(60000); // a huge frame lands on the target, not past it
    expect(motionUniforms.uWind.value).toBeLessThanOrEqual(1.8);
    expect(motionUniforms.uWind.value).toBeCloseTo(1.8, 6);
    setWind(1);
    for (let i = 0; i < 90; i++) advanceMotion(16);
    expect(Math.abs(motionUniforms.uWind.value - 1)).toBeLessThan(0.008); // and back down when the rain stops
  });
  it('the wind eases at the same pace at any frame rate', () => {
    setWind(1.8);
    for (let i = 0; i < 20; i++) advanceMotion(1000 / 60);
    const fast = motionUniforms.uWind.value;
    snapWind(1);
    setWind(1.8);
    for (let i = 0; i < 10; i++) advanceMotion(1000 / 30);
    expect(motionUniforms.uWind.value).toBeCloseTo(fast, 2);
    expect(WIND_EASE_SECONDS).toBeLessThan(0.5);
  });
  it('freezeMotion holds time 0, motion off and daylight water (no night glow) until restored', () => {
    advanceMotion(1234);
    setReducedMotion(false);
    setNight(1);
    setMoon(1);
    const restore = freezeMotion();
    expect(motionUniforms.uTime.value).toBe(0);
    expect(motionUniforms.uMotion.value).toBe(0);
    expect(motionUniforms.uNight.value).toBe(0);
    expect(motionUniforms.uMoon.value).toBe(0);
    restore();
    expect(motionUniforms.uTime.value).toBeCloseTo(1.234);
    expect(motionUniforms.uMotion.value).toBe(1);
    expect(motionUniforms.uNight.value).toBe(1);
    expect(motionUniforms.uMoon.value).toBe(1);
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
    for (const s of ['attribute vec4 anim;', 'attribute vec3 pivot;', 'attribute vec4 axis;', 'uniform float uTime;',
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

  it('unpacks anim with exactly the TS steps and re-normalises the byte axis (parity)', () => {
    expect(MOTION_VERTEX_SETUP).toContain('int motionPacked = int( anim.x + 0.5 );'); // a whole number: rounding, not truncation
    expect(MOTION_VERTEX_SETUP).toContain(`anim.yzw * vec3( ${glslFloat(ANIM_STEP[1])}, ${glslFloat(ANIM_STEP[2])}, ${glslFloat(ANIM_STEP[3])} )`);
    expect(MOTION_VERTEX_SETUP).toContain('normalize( axis.xyz )');
    expect(MOTION_VERTEX_SETUP.match(/\banim\.\w+/g)).toEqual(['anim.x', 'anim.yzw']); // only through the unpack
    expect(MOTION_VERTEX_SETUP.match(/\baxis\b(\.\w+)?/g)).toEqual(['axis.xyz']);
  });

  it('a still part with a steady light (anim.x == 0) skips all the motion maths', () => {
    const gate = 'if ( motionPacked != 0 ) {';
    const i = MOTION_VERTEX_SETUP.indexOf(gate);
    expect(i).toBeGreaterThan(0);
    const before = MOTION_VERTEX_SETUP.slice(0, i);
    for (const costly of ['sin(', 'motionHash(', 'normalize(', 'modelMatrix', 'motionRotation(']) expect(before).not.toContain(costly);
    // the defaults a still vertex keeps: no light change, no move, a zero vAnim (the fragment reads it as still)
    for (const d of ['vLight = 1.0;', 'vAnim = vec4( 0.0 );', 'bool motionMoves = false;', 'mat3 motionRot = mat3( 1.0 );', 'vec3 motionShift = vec3( 0.0 );']) {
      expect(before).toContain(d);
    }
    // the gate's block runs to the end of the setup
    const after = MOTION_VERTEX_SETUP.slice(i + gate.length).trimEnd();
    let depth = 1;
    let closed = -1;
    for (let k = 0; k < after.length && closed < 0; k++) {
      depth += after[k] === '{' ? 1 : after[k] === '}' ? -1 : 0;
      if (depth === 0) closed = k;
    }
    expect(closed).toBe(after.length - 1);
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
    for (const k of ['uTime', 'uWind', 'uMotion', 'uNight', 'uMoon'] as const) {
      expect(a.uniforms[k]).toBe(motionUniforms[k]);
      expect(b.uniforms[k]).toBe(motionUniforms[k]);
    }
  });

  it('fails loudly when three renames a chunk it hooks into', () => {
    const s = standard();
    s.vertexShader = s.vertexShader.replace('#include <worldpos_vertex>', '');
    expect(() => patchMotionShader(s)).toThrow(/worldpos_vertex/);
  });

});

describe('light patterns', () => {
  const sample = (kind: 'breathe' | 'blink' | 'window', phase = 0.7, seconds = 30, hz = 200) =>
    Array.from({ length: seconds * hz }, (_, i) => lightPattern(kind, i / hz, phase));

  it('steady and reduced motion hold exactly 1.0', () => {
    expect(lightPattern('steady', 12.3, 1)).toBe(1);
    for (const k of ['breathe', 'blink'] as const) expect(lightPattern(k, 12.3, 1, 0)).toBe(1);
  });
  it('a window keeps its static per-pane variation when motion is off', () => {
    expect(lightPattern('window', 5, 1, 0)).toBe(lightPattern('window', 0, 1, 1));
    expect(lightPattern('window', 5, 1, 0)).not.toBe(lightPattern('window', 5, 3, 0));
  });
  it('breathe stays within BREATHE_MIN..1.0, reaches both ends, and is a gentle dip (the floor is not a blink)', () => {
    const v = sample('breathe');
    expect(BREATHE_MID + BREATHE_AMP).toBeCloseTo(1, 12);
    expect(BREATHE_MID - BREATHE_AMP).toBeCloseTo(BREATHE_MIN, 12);
    expect(BREATHE_MIN).toBeGreaterThan(BLINK_OFF_LEVEL + 0.1); // never as dark as a blink's off
    expect(BREATHE_MIN).toBeLessThanOrEqual(0.5); // deep enough to read on smooth, where tone mapping flattens a bright glow
    expect(Math.min(...v)).toBeGreaterThanOrEqual(BREATHE_MIN - 1e-9);
    expect(Math.max(...v)).toBeLessThanOrEqual(1 + 1e-9);
    expect(Math.min(...v)).toBeLessThan(BREATHE_MIN + 0.01);
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
    expect(packLight(MOTION_CODE.spin, 'chase')).toBe(MOTION_CODE.spin + LIGHT_STRIDE * LIGHT_CODE.chase);
    expect(() => packLight(0, 'flash' as never)).toThrow(/unknown light/);
    expect(MOTION_VERTEX_SETUP).toContain('vLight');
    expect(MOTION_FRAGMENT_PARS).toContain('varying float vLight');
  });
  it('every light code packed with every motion code fits anim and decodes back (packing guard)', () => {
    expect(Object.keys(LIGHT_CODE)).toEqual(['steady', 'breathe', 'blink', 'window', 'chase']);
    expect(new Set(Object.values(LIGHT_CODE)).size).toBe(Object.keys(LIGHT_CODE).length);
    for (const light of Object.keys(LIGHT_CODE) as (keyof typeof LIGHT_CODE)[]) {
      for (const motion of Object.values(MOTION_CODE)) {
        const x = unpackAnim(packAnim([packLight(motion, light), 0, 0, 0]))[0];
        expect(Math.floor(x / LIGHT_STRIDE)).toBe(LIGHT_CODE[light]);
        expect(x % LIGHT_STRIDE).toBe(motion);
      }
    }
  });
});

describe('chase lights', () => {
  /** Indices of the lit bulbs of one run of `count` (one phase: one item) at `time`. */
  const lit = (count: number, time: number, phase = 0.4, motion = 1) =>
    Array.from({ length: count }, (_, index) => index).filter((index) => lightPattern('chase', time, phase, motion, { index, count }) === 1);

  it('lights about a third of the run, at least one bulb', () => {
    expect([2, 3, 4, 5, 6, 8, 12, 16, 24, CHASE_MAX_COUNT].map(chaseRunLength)).toEqual([1, 1, 1, 2, 2, 3, 4, 5, 8, 21]);
    expect(CHASE_LIT_SHARE).toBeCloseTo(1 / 3, 12);
  });
  it('each bulb is either on or dim; a lit stretch of chaseRunLength bulbs in a row (round the ring) at every moment', () => {
    for (const count of [2, 3, 5, 8, 12, 24, CHASE_MAX_COUNT]) {
      for (let t = 0; t < 6; t += 0.137) {
        const on = lit(count, t);
        expect(on.length, `${count} @ ${t}`).toBe(chaseRunLength(count));
        // in a row: walking up from the first lit bulb after a dim one, every lit bulb follows the last
        const start = on.find((i) => !on.includes((i - 1 + count) % count)) ?? on[0];
        expect(on.map((_, k) => (start + k) % count).sort((a, b) => a - b)).toEqual(on);
        for (let index = 0; index < count; index++) {
          expect([1, CHASE_OFF_LEVEL]).toContain(lightPattern('chase', t, 0.4, 1, { index, count }));
        }
      }
    }
  });
  it('runs one bulb a step towards higher indices, a step every 1 / CHASE_STEP_HZ s', () => {
    const step = 1 / CHASE_STEP_HZ;
    for (const count of [3, 12]) {
      for (const t0 of [0.01, 1.3, 7.77]) {
        const a = lit(count, t0);
        const b = lit(count, t0 + step);
        expect(b, `${count} @ ${t0}`).toEqual(a.map((i) => (i + 1) % count).sort((x, y) => x - y));
      }
    }
  });
  it('one step is at most 3 Hz, so no bulb ever changes faster than 3 times a second', () => {
    expect(CHASE_STEP_HZ).toBeLessThanOrEqual(LIGHT_MAX_HZ);
    for (const count of [2, 3, 12]) {
      for (let index = 0; index < count; index++) {
        const hz = 400;
        let flips = 0;
        let prev = lightPattern('chase', 0, 1.1, 1, { index, count });
        for (let i = 1; i < 60 * hz; i++) {
          const v = lightPattern('chase', i / hz, 1.1, 1, { index, count });
          if (v !== prev) flips++;
          prev = v;
        }
        expect(flips / 60, `${index} of ${count}`).toBeLessThanOrEqual(LIGHT_MAX_HZ);
      }
    }
  });
  it('reduced motion holds every bulb fully on, steady', () => {
    for (const t of [0, 0.3, 5.5, 100]) expect(lit(12, t, 0.4, 0)).toHaveLength(12);
  });
  it('the item phase moves where the run is, so placed copies do not run in step', () => {
    const at = (phase: number) => lit(12, 3.21, phase).join();
    expect(new Set([0, 0.9, 2.1, 3.3, 4.6].map(at)).size).toBeGreaterThan(1);
  });
  it('needs the bulb slot', () => {
    expect(() => lightPattern('chase', 1, 0)).toThrow(/chase/);
  });
  it("a bulb's slot packs into anim's amount and comes back exactly, for every run size (packing guard)", () => {
    for (let count = 2; count <= CHASE_MAX_COUNT; count++) {
      for (let index = 0; index < count; index++) {
        const stored = packAnim([packLight(MOTION_CODE.spin, 'chase'), packChase({ index, count }), 0.4, 1.5]);
        expect(Math.abs(stored[1])).toBeLessThanOrEqual(32767);
        expect(unpackChase(unpackAnim(stored)[1])).toEqual({ index, count });
      }
    }
  });
  it('refuses a slot that is not a bulb of a run of 2..CHASE_MAX_COUNT', () => {
    for (const bad of [{ index: 0, count: 1 }, { index: 0, count: CHASE_MAX_COUNT + 1 }, { index: 3, count: 3 }, { index: -1, count: 3 },
      { index: 0.5, count: 3 }, { index: 0, count: 2.5 }, { index: NaN, count: 4 }]) {
      expect(() => packChase(bad), JSON.stringify(bad)).toThrow(/style kit: chase/);
    }
  });
});

describe('chase light shader', () => {
  /**
   * The chase GLSL run as JavaScript: the shader's own text, with only GLSL spellings swapped for JS
   * ones, so this checks the maths the GPU runs against lightPattern (parity), not a copy of it.
   */
  const glslAsJs = new Function('motionParams', 'uTime', 'motionPhase',
    `let vLight = 1.0;\n${CHASE_LIGHT_GLSL
      .replace(/\bfloat (\w+) =/g, 'const $1 =')
      .replace(/\b(floor|max)\(/g, 'Math.$1(')}\nreturn vLight;`) as (p: { x: number }, t: number, phase: number) => number;

  it('runs the same maths as lightPattern (parity)', () => {
    for (const count of [2, 3, 7, 12, CHASE_MAX_COUNT]) {
      for (let index = 0; index < count; index += Math.max(1, Math.floor(count / 5))) {
        // what the shader sees: anim.y unpacked (motionParams.x), the phase with the item hash added
        const amount = unpackAnim(packAnim([0, packChase({ index, count }), 0, 0]))[1];
        for (const phase of [0, 0.7, TAU - 0.01, 9.4]) {
          for (let t = 0; t < 20; t += 0.0913) {
            expect(glslAsJs({ x: amount }, t, phase), `${index}/${count} t=${t} phase=${phase}`)
              .toBe(lightPattern('chase', t, phase, 1, { index, count }));
          }
        }
      }
    }
  });
  it('runs only for chase bulbs and only while motion is on (reduced motion keeps vLight 1.0)', () => {
    const motionOn = MOTION_VERTEX_SETUP.indexOf('if ( uMotion > 0.0 ) {');
    const branch = MOTION_VERTEX_SETUP.indexOf(`else if ( lightCode == ${LIGHT_CODE.chase} ) {`);
    expect(motionOn).toBeGreaterThan(0);
    expect(branch).toBeGreaterThan(motionOn);
    expect(MOTION_VERTEX_SETUP).toContain(CHASE_LIGHT_GLSL);
    // the branch sits inside the motion-on block: that block closes after it
    const block = MOTION_VERTEX_SETUP.slice(motionOn);
    let depth = 0;
    let end = -1;
    for (let k = 0; k < block.length && end < 0; k++) {
      depth += block[k] === '{' ? 1 : block[k] === '}' ? -1 : 0;
      if (depth === 0 && block[k] === '}') end = motionOn + k;
    }
    expect(branch).toBeLessThan(end);
    expect(MOTION_VERTEX_SETUP.indexOf(CHASE_LIGHT_GLSL)).toBeLessThan(end);
  });
  it('bakes exactly the TS constants', () => {
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasToken = (src: string, n: number) => new RegExp(`(?<![\\w.])${esc(glslFloat(n))}(?![\\w.])`).test(src);
    for (const n of [CHASE_STEP_HZ, CHASE_LIT_SHARE, CHASE_OFF_LEVEL, CHASE_MAX_COUNT, 1 / ANIM_STEP[1], TAU]) {
      expect(hasToken(CHASE_LIGHT_GLSL, n), String(n)).toBe(true);
    }
  });
});

describe('water look', () => {
  type Look = 'pond' | 'pool';
  const lum = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  /** A 4 x 4 unit patch of water sampled every 1.3 cm (about 95 000 points, several glint cells per unit). */
  const patch = (fn: (x: number, z: number) => number) => {
    const out: number[] = [];
    for (let i = 0; i < 308; i++) for (let j = 0; j < 308; j++) out.push(fn(3.1 + i * 0.013, 7.4 + j * 0.013));
    return out;
  };
  const night = { night: 1, moon: 1 };
  const reversalsPerSecond = (fn: (t: number) => number, seconds = 60, hz = 120) => {
    let flips = 0;
    let prevSlope = 0;
    let prev = fn(0);
    for (let i = 1; i <= seconds * hz; i++) {
      const v = fn(i / hz);
      const slope = Math.sign(Math.round((v - prev) * 1e6));
      if (slope !== 0 && prevSlope !== 0 && slope !== prevSlope) flips++;
      if (slope !== 0) prevSlope = slope;
      prev = v;
    }
    return flips / seconds;
  };

  it('by day, both waters show slow highlight bands over part of the surface and emit nothing', () => {
    for (const look of ['pond', 'pool'] as Look[]) {
      const day = { time: 3, night: 0, moon: 0 };
      const bands = patch((x, z) => waterLight(look, x, z, day).highlight);
      const lit = bands.filter((v) => v > WATER.band.mix * 0.5).length / bands.length;
      expect(lit, look).toBeGreaterThan(0.08);
      expect(lit, look).toBeLessThan(0.45);
      expect(Math.max(...bands), look).toBeLessThanOrEqual(WATER.band.mix + 1e-9);
      expect(Math.max(...patch((x, z) => lum(waterLight(look, x, z, day).glow))), look).toBe(0);
    }
  });

  it('the bands drift: a point brightens and darkens slowly, never faster than 3 Hz', () => {
    const at = (t: number) => waterLight('pond', 3.3, 7.9, { time: t, night: 0, moon: 0 }).highlight;
    const seen = new Set(Array.from({ length: 600 }, (_, i) => Math.round(at(i / 10) * 100)));
    expect(seen.size).toBeGreaterThan(5); // it does move
    expect(reversalsPerSecond(at)).toBeLessThanOrEqual(LIGHT_MAX_HZ);
  });

  it('a moonlit pond is dark water with sparse silver glints, not a glowing disc', () => {
    const glow = patch((x, z) => lum(waterLight('pond', x, z, { time: 11, ...night }).glow));
    const peak = Math.max(...glow);
    const lit = glow.filter((v) => v > 0.1 * peak).length / glow.length;
    const mean = glow.reduce((a, b) => a + b, 0) / glow.length;
    const sorted = [...glow].sort((a, b) => a - b);
    expect(peak).toBeGreaterThan(0.5); // a glint is bright
    expect(sorted[Math.floor(glow.length / 2)]).toBe(0); // most of the pond does not glow at all
    expect(lit).toBeGreaterThan(0.002);
    expect(lit).toBeLessThan(0.05); // sparse
    expect(mean).toBeLessThan(0.03); // the pond as a whole stays dark
  });

  it('pond glints follow the moonlight: fainter at dusk, none in rain or by day', () => {
    const total = (moon: number, nightness: number) =>
      patch((x, z) => lum(waterLight('pond', x, z, { time: 11, night: nightness, moon }).glow)).reduce((a, b) => a + b, 0);
    expect(total(0.35, 0.6)).toBeCloseTo(0.35 * total(1, 1));
    expect(total(0, 1)).toBe(0); // rain at night: clouds hide the moon
    expect(total(0, 0)).toBe(0);
  });

  it('glints twinkle and drift slowly (under 3 Hz) and are still there, unmoving, with reduced motion', () => {
    const point = (t: number, motion = 1) => lum(waterLight('pond', 3.37, 8.02, { time: t, ...night, motion }).glow);
    const glints = (t: number, motion = 1) => patch((x, z) => lum(waterLight('pond', x, z, { time: t, ...night, motion }).glow));
    expect(reversalsPerSecond(point)).toBeLessThanOrEqual(LIGHT_MAX_HZ);
    expect(glints(4)).not.toEqual(glints(9));
    const still = glints(4, 0);
    expect(still).toEqual(glints(97, 0));
    expect(Math.max(...still)).toBeGreaterThan(0.5); // reduced motion still shows the moonlight
  });

  it('a pool glows soft cyan all over at night, with a slow brighter shimmer', () => {
    const glow = patch((x, z) => lum(waterLight('pool', x, z, { time: 6, ...night }).glow));
    const min = Math.min(...glow);
    const max = Math.max(...glow);
    expect(min).toBeGreaterThan(0.15); // every bit of the pool glows
    expect(max).toBeGreaterThan(min * 1.3); // the shimmer shows
    expect(max).toBeLessThan(1.2); // soft: at most a gentle bloom on pretty
    const [r, g, b] = waterLight('pool', 3.5, 8, { time: 6, ...night }).glow;
    expect(g).toBeGreaterThan(2 * r);
    expect(b).toBeGreaterThan(2 * r);
    const at = (t: number) => lum(waterLight('pool', 3.5, 8, { time: t, ...night }).glow);
    expect(reversalsPerSecond(at)).toBeLessThanOrEqual(LIGHT_MAX_HZ);
  });

  it('the pool glow follows the lights (dusk 0.6, also in rain) and is off by day; reduced motion holds it still', () => {
    const at = (nightness: number, moon: number, t = 6, motion = 1) => waterLight('pool', 3.5, 8, { time: t, night: nightness, moon, motion }).glow;
    expect(lum(at(0.6, 0.35))).toBeCloseTo(0.6 * lum(at(1, 1)));
    expect(lum(at(1, 0))).toBeCloseTo(lum(at(1, 1))); // rain: the pool lights stay on
    expect(lum(at(0, 0))).toBe(0);
    expect(at(1, 1, 5, 0)).toEqual(at(1, 1, 50, 0));
    expect(lum(at(1, 1, 5, 0))).toBeGreaterThan(0.15);
  });

  it('night darkens the water itself (the pool most, so its glow reads as light from below); day leaves it be', () => {
    const dim = (look: Look, nightness: number) => waterLight(look, 3.5, 8, { time: 6, night: nightness, moon: 0 }).dim;
    expect(dim('pond', 0)).toBe(1);
    expect(dim('pool', 0)).toBe(1);
    expect(dim('pond', 1)).toBeLessThan(1);
    expect(dim('pool', 1)).toBeLessThan(dim('pond', 1));
    expect(dim('pool', 1)).toBeGreaterThan(0.2);
    expect(dim('pool', 0.6)).toBeCloseTo(1 - 0.6 * (1 - dim('pool', 1)));
  });

  it('amount scales the look and speed its pace', () => {
    const glow = (amount: number) => lum(waterLight('pool', 3.5, 8, { time: 6, ...night, amount }).glow);
    expect(glow(0.5)).toBeCloseTo(0.5 * glow(1));
    const band = (speed: number, t: number) => waterLight('pond', 3.3, 7.9, { time: t, night: 0, moon: 0, speed }).highlight;
    expect(band(2, 3)).toBeCloseTo(band(1, 6));
  });
});

describe('water shader', () => {
  const standard = () => ({
    uniforms: {} as Record<string, THREE.IUniform>,
    vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: THREE.ShaderLib.standard.fragmentShader,
  });

  it('draws pond and pool in the fragment shader after the vertex colour, and never moves a vertex', () => {
    const s = standard();
    patchMotionShader(s);
    const vertex = s.vertexShader;
    patchWaterShader(s);
    expect(s.vertexShader).toBe(vertex);
    const f = s.fragmentShader;
    expect(f.indexOf('#include <color_fragment>')).toBeLessThan(f.indexOf('int waterKind'));
    expect(f.indexOf('int waterKind')).toBeLessThan(f.indexOf('#include <lights_fragment_begin>'));
    expect(f.indexOf('float waterGlint(')).toBeLessThan(f.indexOf('void main()'));
    expect(WATER_FRAGMENT).toContain(`waterKind == ${MOTION_CODE.pond}`);
    expect(WATER_FRAGMENT).toContain(`waterKind == ${MOTION_CODE.pool}`);
    for (const u of ['uTime', 'uMotion', 'uNight', 'uMoon', 'totalEmissiveRadiance', 'diffuseColor']) expect(WATER_FRAGMENT).toContain(u);
    expect(WATER_FRAGMENT).toContain(glslFloat(WATER.nightDim.pond));
    expect(WATER_FRAGMENT).toContain(glslFloat(WATER.nightDim.pool));
    // water never moves: the vertex shader only moves sway..swing
    expect(MOTION_CODE.pond).toBeGreaterThan(MOTION_CODE.swing);
    expect(MOTION_VERTEX_SETUP).toContain(`motionKind <= ${MOTION_CODE.swing}`);
  });

  it('declares the moon uniform for the fragment and shares it', () => {
    expect(MOTION_FRAGMENT_PARS).toContain('uniform float uMoon;');
    const s = standard();
    patchMotionShader(s);
    expect(s.uniforms.uMoon).toBe(motionUniforms.uMoon);
  });

  it('fails loudly when three renames the chunk it hooks into', () => {
    const s = standard();
    patchMotionShader(s);
    s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '');
    expect(() => patchWaterShader(s)).toThrow(/color_fragment/);
  });

  it('writes the TS constants into the GLSL exactly', () => {
    for (const v of [1, 0, 0.45, 1.1, -4.6, TAU, 12.9898, 1e-3, 0.17]) {
      const g = glslFloat(v);
      expect(g, String(v)).toMatch(/^-?\d+\.\d+$/);
      expect(Number(g)).toBe(v);
    }
    const glsl = WATER_FRAGMENT_PARS + WATER_FRAGMENT;
    for (const v of [WATER.glint.share, WATER.glint.cell, WATER.glint.power, WATER.band.mix, WATER.band.speed, WATER.pool.base, WATER.pool.scale]) {
      expect(glsl).toContain(glslFloat(v));
    }
  });
  it('the shader bakes exactly the TS constants (parity): whole literals, not substrings', () => {
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    /** The literal as a whole GLSL token (not a piece of a longer number or name). */
    const hasToken = (src: string, n: number) => new RegExp(`(?<![\\w.])${esc(glslFloat(n))}(?![\\w.])`).test(src);
    for (const n of [TAU, BREATHE_MID, BREATHE_AMP, BREATHE_PERIOD, BLINK_PERIOD, BLINK_ON, BLINK_OFF_LEVEL, WINDOW_VARIATION]) {
      expect(hasToken(MOTION_VERTEX_SETUP, n), String(n)).toBe(true);
    }
    // the expressions, token for token
    expect(MOTION_VERTEX_SETUP).toContain(`vLight = ${glslFloat(BREATHE_MID)} + ${glslFloat(BREATHE_AMP)} * sin( ${glslFloat(TAU)} * uTime / ${glslFloat(BREATHE_PERIOD)} + motionPhase )`);
    expect(MOTION_VERTEX_SETUP).toContain(`fract( uTime / ${glslFloat(BLINK_PERIOD)} + motionPhase / ${glslFloat(TAU)} ) < ${glslFloat(BLINK_ON)} ? 1.0 : ${glslFloat(BLINK_OFF_LEVEL)}`);
    expect(MOTION_VERTEX_SETUP).toContain(`vLight = 1.0 + ${glslFloat(WINDOW_VARIATION)} * ( 2.0 * fract( motionPhase / ${glslFloat(TAU)} ) - 1.0 )`);
    expect(hasToken('x 0.15 y', 0.15)).toBe(true);
    expect(hasToken('x 10.15 y', 0.15)).toBe(false); // the matcher itself is strict
    expect(hasToken('x 0.155 y', 0.15)).toBe(false);
  });
  it('breathing is far below 3 Hz', () => {
    expect(1 / BREATHE_PERIOD).toBeLessThanOrEqual(LIGHT_MAX_HZ);
  });
  it('every motion code fits under the light stride', () => {
    for (const c of Object.values(MOTION_CODE)) expect(c).toBeLessThan(LIGHT_STRIDE);
  });
});
