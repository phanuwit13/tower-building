import type * as THREE from 'three';
import type { Vec3 } from './kit';

/**
 * GPU item animation. Every kit part carries three per-vertex attributes (all zero = still):
 *   anim  (kind code, amount, speed, phase offset)
 *   pivot the point the motion is about, in item space (a position: placements move it)
 *   axis  the motion's direction, unit length (a direction: placements turn it)
 * packed into 24 bytes a vertex (see MOTION_ATTRIBUTES). The two kit materials read them in their
 * vertex shader with the shared `motionUniforms`, so swaying, waving, spinning and swinging cost no
 * draw calls and no per-frame CPU work. Shadows stay static: the shadow map is drawn with three's
 * own depth material (the rest pose), and moving surfaces look their shadows up where their rest
 * pose is.
 */
export type MotionKind = 'sway' | 'wave' | 'spin' | 'swing' | 'water';

export interface MotionOpts {
  kind: MotionKind;
  /**
   * Item-space point the motion is about. Defaults: sway = the base of the part (its lowest point
   * under `at`); everything else = `at`.
   */
  pivot?: Vec3;
  /**
   * Defaults: sway = straight up (height is measured along it); wave = +x (along the cloth, away
   * from the pole; must not be upright); spin = straight up; swing = x (the bar it hangs from).
   */
  axis?: Vec3;
  /** sway: lean per unit of height; wave: sideways ripple per unit of cloth; swing: max angle (radians); spin: unused. At most ±4. */
  amount?: number;
  /** Radians per second: spin's turn rate (negative turns the other way), the others' rhythm. At most ±16. */
  speed?: number;
  /** Extra phase in radians (parts of one item out of step); each placed item also gets its own. At most ±16. */
  phase?: number;
  /** For `kind: 'water'`: a pond (default) or a pool; the water look is drawn in the fragment shader. */
  water?: 'pond' | 'pool';
}

/** `anim.x` codes. 0 is still; water is split by look. */
export const MOTION_CODE = { none: 0, sway: 1, wave: 2, spin: 3, swing: 4, pond: 5, pool: 6 } as const;

/**
 * Glow-part light patterns, packed into `anim.x` beside the motion code: `anim.x = motion code +
 * LIGHT_STRIDE * light code` (so the attribute set is unchanged and a glowing swing seat can both
 * move and breathe). The vertex shader decodes it, evaluates the pattern and passes the result to
 * the fragment shader as `vLight`, a multiplier of the glow strength.
 */
export type LightKind = 'steady' | 'breathe' | 'blink' | 'window' | 'chase';
export const LIGHT_CODE = { steady: 0, breathe: 1, blink: 2, window: 3, chase: 4 } as const;
/** Every motion code must stay below this: the light code lives in the digits above it. */
export const LIGHT_STRIDE = 8;
if (Object.values(MOTION_CODE).some((c) => c >= LIGHT_STRIDE)) {
  throw new Error('motion: every MOTION_CODE must be below LIGHT_STRIDE (it is packed with the light code in anim.x)');
}
/** A full turn, as the shaders spell it (one place, emitted into GLSL with glslFloat). */
export const TAU = 6.2831853;
/**
 * Breathe: BREATHE_MIN..1.0 over 3 s (a sine about BREATHE_MID with amplitude BREATHE_AMP). The floor is low
 * because tone mapping saturates a bright glow: on the smooth tier a dip to 0.65 never showed.
 * Blink: 1.4 s a cycle (on 55 %, dim 0.1 when off). Window: steady ±15 %.
 */
export const BREATHE_MIN = 0.22;
export const BREATHE_MID = (1 + BREATHE_MIN) / 2;
export const BREATHE_AMP = (1 - BREATHE_MIN) / 2;
export const BREATHE_PERIOD = 3;
export const BLINK_PERIOD = 1.4;
export const BLINK_ON = 0.55;
export const BLINK_OFF_LEVEL = 0.1;
export const WINDOW_VARIATION = 0.15;
/** Hard upper bound on any pattern's on/off-or-peak rate, in Hz (a safety limit, not a speed). */
export const LIGHT_MAX_HZ = 3;

/**
 * Chase (running lights round a ring or along a line): the bulbs of one run take turns. A lit
 * stretch of about a third of them (CHASE_LIT_SHARE, at least one bulb: chaseRunLength) steps on
 * one bulb, towards higher indices, CHASE_STEP_HZ times a second; the rest are dim (CHASE_OFF_LEVEL).
 * So no bulb changes more often than CHASE_STEP_HZ, whatever the run size. Each bulb knows its
 * place in the run (ChaseSlot), packed into anim's amount (packChase), which a still or spinning
 * part does not use. The item's phase moves where the stretch is, so placed copies run out of step.
 */
export const CHASE_STEP_HZ = 2.5;
export const CHASE_LIT_SHARE = 1 / 3;
export const CHASE_OFF_LEVEL = 0.1;
/** The most bulbs in one run (the slot packing below holds up to this). */
export const CHASE_MAX_COUNT = 64;

/** A chase bulb's place in its run: `index` 0..count-1 in running order, `count` the run's bulbs. */
export interface ChaseSlot { index: number; count: number }

/** How many bulbs of a run of `count` are lit at once: about a third, at least one. */
export function chaseRunLength(count: number): number {
  return Math.max(1, Math.floor(count * CHASE_LIT_SHARE + 0.5));
}

/**
 * Glow multiplier of a light pattern: the same maths as the vertex shader (MOTION_VERTEX_SETUP).
 * `phase` is the part's phase (its own plus the item's); `motion` is `uMotion` (0 holds 1.0);
 * `chase` is a chase bulb's place in its run (required for `chase`).
 */
export function lightPattern(kind: LightKind, time: number, phase: number, motion = 1, chase?: ChaseSlot): number {
  if (kind === 'steady') return 1;
  const tau = TAU;
  const frac = (x: number) => x - Math.floor(x);
  // a window's per-pane variation is a static look, not motion: it stays when motion is off
  if (kind === 'window') return 1 + WINDOW_VARIATION * (2 * frac(phase / tau) - 1);
  if (kind === 'chase' && !chase) throw new Error('lightPattern: a chase light needs its slot ({ index, count })');
  if (!(motion > 0)) return 1;
  if (kind === 'breathe') return BREATHE_MID + BREATHE_AMP * Math.sin((tau * time) / BREATHE_PERIOD + phase);
  if (kind === 'blink') return frac(time / BLINK_PERIOD + phase / tau) < BLINK_ON ? 1 : BLINK_OFF_LEVEL;
  if (kind === 'chase' && chase) {
    // k: how many steps ago the stretch's head passed this bulb (0..count-1); + 0.5 keeps the floor off exact multiples
    const d = Math.floor(time * CHASE_STEP_HZ + phase / tau * chase.count) - chase.index;
    const k = d - chase.count * Math.floor((d + 0.5) / chase.count);
    return k < chaseRunLength(chase.count) ? 1 : CHASE_OFF_LEVEL;
  }
  return 1;
}

/** The packed `anim.x` of a motion code and a light kind. */
export function packLight(motionCode: number, light: LightKind): number {
  const code = LIGHT_CODE[light];
  if (code === undefined) throw new Error(`style kit: unknown light "${String(light)}" (steady, breathe, blink, window or chase)`);
  return motionCode + LIGHT_STRIDE * code;
}

/**
 * The anim amount that carries a chase bulb's slot: `index + CHASE_MAX_COUNT * count` anim steps,
 * so it is stored as that whole number and comes back exactly (unpackChase). Throws on a slot that
 * is not a bulb of a run of 2..CHASE_MAX_COUNT.
 */
export function packChase({ index, count }: ChaseSlot): number {
  if (!Number.isInteger(count) || count < 2 || count > CHASE_MAX_COUNT) {
    throw new Error(`style kit: chase count must be a whole number from 2 to ${CHASE_MAX_COUNT} (got ${count})`);
  }
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new Error(`style kit: chase index must be a whole number from 0 to count - 1 (got ${index} of ${count})`);
  }
  return (index + CHASE_MAX_COUNT * count) * ANIM_STEP[1];
}

/** A chase bulb's slot from its unpacked anim amount (the shader decodes it the same way). */
export function unpackChase(amount: number): ChaseSlot {
  const slot = Math.floor(amount / ANIM_STEP[1] + 0.5);
  const count = Math.floor((slot + 0.5) / CHASE_MAX_COUNT);
  return { index: slot - CHASE_MAX_COUNT * count, count };
}

/** Gentle by default. */
export const MOTION_DEFAULTS: Record<MotionKind, { amount: number; speed: number }> = {
  sway: { amount: 0.05, speed: 1.7 }, // a 1-unit crown leans ±5 cm, about 3.7 s a sway
  wave: { amount: 0.18, speed: 6 }, // the free edge of a 0.5-unit flag ripples ±9 cm, about 1 s a ripple
  spin: { amount: 1, speed: 0.5 }, // one turn in about 12.6 s
  swing: { amount: 0.3, speed: 2 }, // ±17°, about 3.1 s a swing
  water: { amount: 1, speed: 1 },
};

/** Bounding-sphere padding (world units) for meshes that move, so frustum culling never clips a sway. */
export const CULL_MARGIN = 0.3;

/**
 * How the motion attributes are stored (24 bytes a vertex; plain floats took 40). Every stride is a
 * multiple of 4 bytes, so no GPU backend (Metal on iPads and Macs) has to realign the buffers.
 *   anim  Int16 x4, whole numbers: the packed code as it is; amount, speed and phase as multiples of
 *         ANIM_STEP (packAnim). The vertex shader multiplies them back.
 *   pivot Float32 x3: kept exact. Placements move it anywhere on the map, and each item's phase is a
 *         hash of its world pivot (a sub-millimetre change would reshuffle every item's rhythm).
 *   axis  Int8 x4, normalised: x, y, z times 127 (packAxis), w unused. The shader re-normalises it;
 *         the axis directions are exact, any other direction is within 0.4°.
 */
export const MOTION_ATTRIBUTES = {
  anim: { array: Int16Array, itemSize: 4, normalized: false },
  pivot: { array: Float32Array, itemSize: 3, normalized: false },
  axis: { array: Int8Array, itemSize: 4, normalized: true },
} as const;
export type MotionAttribute = keyof typeof MOTION_ATTRIBUTES;

/**
 * anim's fixed-point steps (code, amount, speed, phase): an amount comes back within 0.00013, a
 * speed (rad/s) and a phase (rad) within 0.0005. Powers of two, so the shader's multiply is exact.
 */
export const ANIM_STEP = [1, 2 ** -12, 2 ** -10, 2 ** -10] as const;
/**
 * The largest amount, speed (rad/s) and phase (rad) a motion may take (either sign), well inside
 * what anim holds: a window pane adds up to 2π to the phase.
 */
export const MOTION_LIMITS = { amount: 4, speed: 16, phase: 16 } as const;

const INT16_MAX = 32767;
// packing guard: the largest packed anim.x (any motion code with the last light code) and the largest chase slot fit anim
if (LIGHT_STRIDE * (Math.max(...Object.values(LIGHT_CODE)) + 1) > INT16_MAX || CHASE_MAX_COUNT * (CHASE_MAX_COUNT + 1) > INT16_MAX) {
  throw new Error('motion: the packed light codes and chase slots must fit anim (Int16)');
}

/** anim's stored values (whole numbers) for `[code, amount, speed, phase]`; throws on what it cannot hold. */
export function packAnim(anim: readonly number[]): number[] {
  if (!Number.isInteger(anim[0])) throw new Error(`style kit: the motion code must be a whole number (got ${anim[0]})`);
  return anim.map((v, i) => {
    const q = Math.round(v / ANIM_STEP[i]);
    if (!(Math.abs(q) <= INT16_MAX)) throw new Error(`style kit: motion value ${v} does not fit the packed anim attribute`);
    return q + 0; // + 0: no -0
  });
}

/** `[code, amount, speed, phase]` from anim's stored values (what the shader works with). */
export function unpackAnim(stored: readonly number[]): [number, number, number, number] {
  return [stored[0] * ANIM_STEP[0], stored[1] * ANIM_STEP[1], stored[2] * ANIM_STEP[2], stored[3] * ANIM_STEP[3]];
}

/** axis's stored bytes for a unit direction (a zero vector for a still part stays zero). */
export function packAxis(axis: Vec3): [number, number, number, number] {
  const q = (v: number) => Math.round(Math.max(-1, Math.min(1, v)) * 127) + 0;
  return [q(axis[0]), q(axis[1]), q(axis[2]), 0];
}

export interface MotionVertex { anim: [number, number, number, number]; pivot: Vec3; axis: Vec3 }

/**
 * One vertex's motion attributes as the shader uses them: anim unpacked, the axis re-normalised
 * (zero for a still part). For tests and tools; a kit part or a merged chunk.
 */
export function readMotion(g: THREE.BufferGeometry, i: number): MotionVertex {
  const { anim, pivot, axis } = g.attributes;
  const a = unpackAnim([anim.getX(i), anim.getY(i), anim.getZ(i), anim.getW(i)]);
  const d: Vec3 = [axis.getX(i), axis.getY(i), axis.getZ(i)]; // three un-normalises the bytes
  const len = Math.hypot(...d);
  return {
    anim: a,
    pivot: [pivot.getX(i), pivot.getY(i), pivot.getZ(i)],
    axis: len > 0 ? [d[0] / len, d[1] / len, d[2] / len] : [0, 0, 0],
  };
}

const UP: Vec3 = [0, 1, 0];
const X: Vec3 = [1, 0, 0];
const DEFAULT_AXIS: Record<MotionKind, Vec3> = { sway: UP, wave: X, spin: UP, swing: X, water: UP };

export interface ResolvedMotion { anim: [number, number, number, number]; pivot: Vec3; axis: Vec3 }

/**
 * The attribute values of one moving part, defaults filled in. `at` is the part's centre and
 * `baseY` its lowest y, both in item space. Throws on a value the shader cannot use.
 */
export function resolveMotion(m: MotionOpts, at: Vec3, baseY: number): ResolvedMotion {
  const defaults = MOTION_DEFAULTS[m.kind];
  if (!defaults) throw new Error(`style kit: unknown motion kind "${String(m.kind)}"`);
  const limited = (v: number, what: keyof typeof MOTION_LIMITS) => {
    if (!Number.isFinite(v)) throw new Error(`style kit: motion ${what} must be a finite number (got ${v})`);
    const max = MOTION_LIMITS[what];
    if (Math.abs(v) > max) throw new Error(`style kit: motion ${what} must be within ±${max} (got ${v})`);
    return v;
  };
  const amount = limited(m.amount ?? defaults.amount, 'amount');
  const speed = limited(m.speed ?? defaults.speed, 'speed');
  const phase = limited(m.phase ?? 0, 'phase');
  const pivot: Vec3 = m.pivot ? [...m.pivot] : m.kind === 'sway' ? [at[0], baseY, at[2]] : [...at];
  if (!pivot.every(Number.isFinite)) throw new Error(`style kit: motion pivot must be three finite numbers (got ${pivot.join(', ')})`);
  const raw = m.axis ?? DEFAULT_AXIS[m.kind];
  const len = Math.hypot(...raw);
  if (!raw.every(Number.isFinite) || len < 1e-6) throw new Error(`style kit: motion axis must be a non-zero direction (got ${raw.join(', ')})`);
  const axis: Vec3 = [raw[0] / len, raw[1] / len, raw[2] / len];
  if (m.kind === 'wave' && Math.abs(axis[1]) > 0.9) {
    throw new Error('style kit: a wave axis runs along the cloth, away from the pole: it cannot point straight up or down');
  }
  const code = m.kind === 'water' ? (m.water === 'pool' ? MOTION_CODE.pool : MOTION_CODE.pond) : MOTION_CODE[m.kind];
  return { anim: [code, amount, speed, phase], pivot, axis };
}

/** The one uniform object every kit material shares (see patchMotionShader). */
export const motionUniforms = {
  /** Seconds of animation; advanced once per frame by the stage. */
  uTime: { value: 0 },
  /** Wind strength: 1 calm, more in rain. */
  uWind: { value: 1 },
  /** 1 = animate, 0 = rest pose (prefers-reduced-motion, thumbnails). */
  uMotion: { value: 1 },
  /** 0 by day to 1 at night (for lights and water). */
  uNight: { value: 0 },
  /** Moonlight, 0..1: how much the moon shows (night 1, dusk and dawn faint, none by day or in rain); pond glints follow it. */
  uMoon: { value: 0 },
};

/** Seconds for the wind to cover about 63 % of the way to a new strength (a gust builds, it does not jump). */
export const WIND_EASE_SECONDS = 0.3;
let windTarget = motionUniforms.uWind.value;

export function advanceMotion(dtMs: number): void {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return;
  motionUniforms.uTime.value += dtMs / 1000;
  // exponential approach: frame-rate independent, never overshoots
  const u = motionUniforms.uWind;
  u.value += (windTarget - u.value) * (1 - Math.exp(-dtMs / 1000 / WIND_EASE_SECONDS));
}

/** Sets the wind to blow towards `w`; `advanceMotion` eases the shared `uWind` there. */
export function setWind(w: number): void {
  windTarget = Math.min(4, Math.max(0, w));
}

/** Jump the wind straight to `w` (tests, first frame). */
export function snapWind(w: number): void {
  setWind(w);
  motionUniforms.uWind.value = windTarget;
}

export function setNight(n: number): void {
  motionUniforms.uNight.value = Math.min(1, Math.max(0, n));
}

export function setMoon(m: number): void {
  motionUniforms.uMoon.value = Math.min(1, Math.max(0, m));
}

export function setReducedMotion(reduce: boolean): void {
  motionUniforms.uMotion.value = reduce ? 0 : 1;
}

type MatchMedia = (query: string) => {
  matches: boolean;
  addEventListener(type: 'change', l: (e: { matches: boolean }) => void): void;
  removeEventListener(type: 'change', l: (e: { matches: boolean }) => void): void;
};

/** Follow `prefers-reduced-motion: reduce` (live); returns a stop function. No matchMedia: motion stays on. */
export function watchReducedMotion(matchMedia: MatchMedia | undefined = globalThis.matchMedia?.bind(globalThis)): () => void {
  const mql = matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!mql) return () => {};
  const onChange = (e: { matches: boolean }) => setReducedMotion(e.matches);
  setReducedMotion(mql.matches);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * Rest pose at time 0, with daylight water (a thumbnail must not bake a random moment, nor the night
 * pool glow or moon glints: thumbnails also turn the glow off); call the result to restore.
 */
export function freezeMotion(): () => void {
  const { uTime, uMotion, uNight, uMoon } = motionUniforms;
  const saved = { time: uTime.value, motion: uMotion.value, night: uNight.value, moon: uMoon.value };
  uTime.value = 0;
  uMotion.value = 0;
  uNight.value = 0;
  uMoon.value = 0;
  return () => {
    uTime.value = saved.time;
    uMotion.value = saved.motion;
    uNight.value = saved.night;
    uMoon.value = saved.moon;
  };
}

/**
 * World wind direction (mostly across the default view, which looks from +x/+z, so a sway reads as
 * a sideways lean). Not normalised here; the shader does.
 */
const WIND_DIR = 'vec3( 1.0, 0.0, -0.75 )';

/** Prepended to the vertex shader: attributes, uniforms, the fragment flag and helpers. */
export const MOTION_VERTEX_PARS = /* glsl */ `
attribute vec4 anim; // packed: see MOTION_ATTRIBUTES
attribute vec3 pivot;
attribute vec4 axis; // normalised bytes, w unused
uniform float uTime;
uniform float uWind;
uniform float uMotion;
uniform float uNight;
varying vec4 vAnim;
varying float vLight;
mat3 motionRotation( vec3 a, float angle ) {
  float s = sin( angle );
  float c = cos( angle );
  float t = 1.0 - c;
  return mat3(
    t * a.x * a.x + c,       t * a.x * a.y + s * a.z, t * a.x * a.z - s * a.y,
    t * a.x * a.y - s * a.z, t * a.y * a.y + c,       t * a.y * a.z + s * a.x,
    t * a.x * a.z + s * a.y, t * a.y * a.z - s * a.x, t * a.z * a.z + c );
}
float motionHash( vec2 p ) {
  return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}
`;

/**
 * A chase bulb's glow (mirrors the chase branch of lightPattern): decode its slot from the amount
 * (packChase), then light it while it is in the running stretch. Every value is a whole number held
 * exactly in a float; each floor has 0.5 of margin, so no GPU rounding can tip it.
 */
export const CHASE_LIGHT_GLSL = /* glsl */ `
      float chaseSlot = floor( motionParams.x * ${glslFloat(1 / ANIM_STEP[1])} + 0.5 );
      float chaseCount = floor( ( chaseSlot + 0.5 ) / ${glslFloat(CHASE_MAX_COUNT)} );
      float chaseD = floor( uTime * ${glslFloat(CHASE_STEP_HZ)} + motionPhase / ${glslFloat(TAU)} * chaseCount ) - ( chaseSlot - ${glslFloat(CHASE_MAX_COUNT)} * chaseCount );
      float chaseK = chaseD - chaseCount * floor( ( chaseD + 0.5 ) / chaseCount );
      vLight = chaseK < max( 1.0, floor( chaseCount * ${glslFloat(CHASE_LIT_SHARE)} + 0.5 ) ) ? 1.0 : ${glslFloat(CHASE_OFF_LEVEL)};
`;

/**
 * After `beginnormal_vertex`: work out this vertex's motion (a rotation about the pivot and a
 * shift) and turn the normal with it. Positions here are in object space: the world for merged
 * chunks, the item for gallery models; the item's phase comes from its pivot in the world. A still
 * part with a steady light (anim.x == 0: most of the map) skips all of it.
 */
export const MOTION_VERTEX_SETUP = /* glsl */ `
int motionPacked = int( anim.x + 0.5 );
vAnim = vec4( 0.0 );
vLight = 1.0;
bool motionMoves = false;
mat3 motionRot = mat3( 1.0 );
vec3 motionShift = vec3( 0.0 );
if ( motionPacked != 0 ) {
  int lightCode = motionPacked / ${LIGHT_STRIDE};
  int motionKind = motionPacked - ${LIGHT_STRIDE} * lightCode;
  vec3 motionParams = anim.yzw * vec3( ${glslFloat(ANIM_STEP[1])}, ${glslFloat(ANIM_STEP[2])}, ${glslFloat(ANIM_STEP[3])} ); // amount, speed, phase
  float motionPhase = motionParams.z + ${glslFloat(TAU)} * motionHash( ( modelMatrix * vec4( pivot, 1.0 ) ).xz );
  vAnim = vec4( float( motionKind ), motionParams.xy, motionPhase );
  // glow light pattern (mirrors lightPattern in this file); steady and reduced motion hold 1.0
  if ( uMotion > 0.0 ) {
    if ( lightCode == ${LIGHT_CODE.breathe} ) vLight = ${glslFloat(BREATHE_MID)} + ${glslFloat(BREATHE_AMP)} * sin( ${glslFloat(TAU)} * uTime / ${glslFloat(BREATHE_PERIOD)} + motionPhase );
    else if ( lightCode == ${LIGHT_CODE.blink} ) vLight = fract( uTime / ${glslFloat(BLINK_PERIOD)} + motionPhase / ${glslFloat(TAU)} ) < ${glslFloat(BLINK_ON)} ? 1.0 : ${glslFloat(BLINK_OFF_LEVEL)};
    else if ( lightCode == ${LIGHT_CODE.chase} ) {${CHASE_LIGHT_GLSL}    }
  }
  if ( lightCode == ${LIGHT_CODE.window} ) vLight = 1.0 + ${glslFloat(WINDOW_VARIATION)} * ( 2.0 * fract( motionPhase / ${glslFloat(TAU)} ) - 1.0 );
  motionMoves = uMotion > 0.0 && motionKind >= ${MOTION_CODE.sway} && motionKind <= ${MOTION_CODE.swing};
  if ( motionMoves ) {
    float motionAmount = motionParams.x;
    vec3 motionAxis = normalize( axis.xyz ); // bytes: re-normalise
    float motionT = uTime * motionParams.y + motionPhase;
    vec3 motionRel = position - pivot;
    if ( motionKind == ${MOTION_CODE.sway} ) {
      // lean downwind in proportion to the height above the pivot; rain leans further
      vec3 wind = normalize( ( vec4( ${WIND_DIR}, 0.0 ) * modelMatrix ).xyz ); // world -> object (rotation)
      float lean = 0.8 * sin( motionT ) + 0.2 * sin( 2.3 * motionT + 1.7 ) + 0.5 * max( uWind - 1.0, 0.0 );
      motionShift = wind * ( motionAmount * uWind * uMotion * lean * max( dot( motionRel, motionAxis ), 0.0 ) );
    } else if ( motionKind == ${MOTION_CODE.wave} ) {
      // a ripple running out along the cloth from the pole, growing towards the free edge
      float along = max( dot( motionRel, motionAxis ), 0.0 );
      vec3 side = cross( motionAxis, vec3( 0.0, 1.0, 0.0 ) );
      side = dot( side, side ) > 1e-6 ? normalize( side ) : vec3( 0.0, 0.0, 1.0 );
      motionShift = side * ( motionAmount * uMotion * min( uWind, 2.0 ) * along * sin( motionT - 7.0 * along ) );
    } else if ( motionKind == ${MOTION_CODE.spin} ) {
      motionRot = motionRotation( motionAxis, uMotion * motionT );
    } else if ( motionKind == ${MOTION_CODE.swing} ) {
      motionRot = motionRotation( motionAxis, uMotion * motionAmount * sin( motionT ) );
    }
    objectNormal = motionRot * objectNormal;
  }
}
`;

/** After `begin_vertex`: keep the rest position, then move the vertex (before project_vertex). */
export const MOTION_VERTEX_APPLY = /* glsl */ `
vec3 motionRest = transformed;
if ( motionMoves ) transformed = pivot + motionRot * ( transformed - pivot ) + motionShift;
`;

/**
 * Before `worldpos_vertex`: the shadow lookup (and anything else after projection) uses the rest
 * pose, the pose the static shadow map was drawn from, so a moving surface never shadows itself.
 * Flat shading derives normals from screen derivatives, so lighting still follows the motion.
 */
export const MOTION_VERTEX_REST = /* glsl */ `
transformed = motionRest;
`;

/** Prepended to the fragment shader: what later patches (lights, water) read. */
export const MOTION_FRAGMENT_PARS = /* glsl */ `
uniform float uTime;
uniform float uWind;
uniform float uMotion;
uniform float uNight;
uniform float uMoon;
varying vec4 vAnim;
varying float vLight;
`;

/** A number as a GLSL float literal that parses back to exactly the same value (1 -> "1.0", 0.45 -> "0.45"). */
export function glslFloat(v: number): string {
  if (!Number.isFinite(v)) throw new Error(`motion shader: ${v} is not a GLSL float`);
  const s = String(v);
  return /[.e]/.test(s) ? s : `${s}.0`;
}
const glslVec = (v: readonly number[]) => `vec${v.length}( ${v.map(glslFloat).join(', ')} )`;

/**
 * Water surfaces (`motion: { kind: 'water' }`, codes pond and pool) never move; the body material's
 * fragment shader draws them, in world space so a pattern runs on across parts and turned items:
 * - any time: slow highlight bands, a warped ripple whose crests are lightened (faded at night);
 * - a pond in moonlight: sparse silver glints that drift and twinkle slowly (no glow of its own, so
 *   night water stays dark); they follow `uMoon`, so dusk is faint and rain clouds hide them;
 * - a pool at night: a soft cyan glow with a slow brighter caustic shimmer, like underwater lights;
 *   it follows `uNight` (the lights), rain or not;
 * - at night the water's own (lit) colour darkens, the pool most, so glints and glow read on dark water.
 * `amount` scales the look, `speed` its pace. Reduced motion freezes the pattern at time 0, still lit.
 * Colours are linear RGB.
 */
export const WATER = {
  band: {
    k: [9, 5.5], speed: 1.1, // the ripple: crests about 0.6 apart, drifting about 0.1 units a second
    warpK: [-4.6, 8.4], warpSpeed: 0.7, warp: 0.9, // a slow cross-ripple bends the crests
    from: 0.55, to: 0.95, // the top of each crest (the swell runs -1..1)
    slope: 10.5, // about how fast the swell changes per unit: widens the edges to a pixel when far away
    mix: 0.3, nightFade: 0.75, colour: [0.75, 0.9, 1],
  },
  glint: {
    cell: 0.17, share: 0.45, // one glint in 45 % of 0.17-unit cells
    len: 0.22, wid: 0.06, axis: [0.7071, -0.7071], // a short streak (in cell units) across the default view
    drift: [0.25, 0.15], // cells a second
    twinkleMin: 0.6, twinkleRange: 0.8, twinkleFrom: 0.55, // each at its own 0.6..1.4 rad/s (4.5..10 s a twinkle), bright about a third of it
    colour: [0.85, 0.9, 1], power: 2.2,
  },
  pool: {
    colour: [0.02, 0.4, 0.5], base: 0.55, shimmer: 0.6, // soft cyan everywhere, brighter on the caustic lines
    scale: 12, width: 0.45, slope: 18,
  },
  /** How much night darkens the surface colour (times uNight). */
  nightDim: { pond: 0.3, pool: 0.6 },
} as const;

export interface WaterInputs {
  time: number; night: number; moon: number;
  /** uMotion (0 = reduced motion: the pattern holds still). */
  motion?: number;
  /** The part's motion amount and speed. */
  amount?: number; speed?: number;
}
/** `highlight`: how far the surface colour moves towards the band colour; `dim`: what the result is then multiplied by; `glow`: emitted light. */
export interface WaterLook { highlight: number; dim: number; glow: [number, number, number] }

const fract = (x: number) => x - Math.floor(x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const waterHash = (x: number, y: number) => fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);

/**
 * The water look at world point (x, z): the same maths as WATER_FRAGMENT, minus its pixel-size
 * anti-aliasing (see WaterLook; colours linear RGB).
 */
export function waterLight(look: 'pond' | 'pool', x: number, z: number, u: WaterInputs): WaterLook {
  const { band: B, glint: G, pool: P } = WATER;
  const t = u.time * (u.motion ?? 1) * (u.speed ?? 1);
  const amount = u.amount ?? 1;
  const swell = Math.sin(x * B.k[0] + z * B.k[1] + B.speed * t + B.warp * Math.sin(x * B.warpK[0] + z * B.warpK[1] - B.warpSpeed * t));
  const highlight = Math.min(1, Math.max(0, smoothstep(B.from, B.to, swell) * B.mix * amount * (1 - B.nightFade * u.night)));
  let level = 0;
  let colour: readonly number[] = G.colour;
  if (look === 'pond') {
    const gx = x / G.cell + G.drift[0] * t;
    const gz = z / G.cell + G.drift[1] * t;
    const cx = Math.floor(gx);
    const cz = Math.floor(gz);
    const h1 = waterHash(cx, cz);
    if (h1 < G.share) {
      const h2 = waterHash(cx + 19.19, cz + 19.19);
      const s = h1 / G.share;
      const dx = gx - cx - 0.5 - (s - 0.5) * 0.5;
      const dz = gz - cz - 0.5 - (h2 - 0.5) * 0.5;
      const ea = (dx * G.axis[0] + dz * G.axis[1]) / G.len;
      const eb = (-dx * G.axis[1] + dz * G.axis[0]) / G.wid;
      const twinkle = 0.5 + 0.5 * Math.sin(t * (G.twinkleMin + G.twinkleRange * h2) + 2 * Math.PI * s);
      level = Math.max(1 - ea * ea - eb * eb, 0) * smoothstep(G.twinkleFrom, 1, twinkle) * G.power * u.moon * amount;
    }
  } else {
    const qx = x * P.scale;
    const qz = z * P.scale;
    const a = Math.sin(qx + 0.6 * t + 1.3 * Math.sin(0.9 * qz - 0.4 * t));
    const b = Math.sin(qz - 0.5 * t + 1.3 * Math.sin(1.1 * qx + 0.35 * t));
    level = (P.base + P.shimmer * (1 - smoothstep(0, P.width, Math.abs(a + b)))) * u.night * amount;
    colour = P.colour;
  }
  const dim = 1 - WATER.nightDim[look] * u.night;
  return { highlight, dim, glow: [colour[0] * level, colour[1] * level, colour[2] * level] };
}

/** Prepended to the body fragment shader: the water helpers (they take everything as arguments). */
export const WATER_FRAGMENT_PARS = /* glsl */ `
float waterHash( vec2 p ) {
  return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
}
float waterSwell( vec2 p, float t ) {
  return sin( dot( p, ${glslVec(WATER.band.k)} ) + ${glslFloat(WATER.band.speed)} * t
    + ${glslFloat(WATER.band.warp)} * sin( dot( p, ${glslVec(WATER.band.warpK)} ) - ${glslFloat(WATER.band.warpSpeed)} * t ) );
}
// px: cell units per pixel; a far glint widens to about a pixel and dims to match (no sparkle aliasing)
float waterGlint( vec2 p, float t, float px ) {
  vec2 g = p / ${glslFloat(WATER.glint.cell)} + ${glslVec(WATER.glint.drift)} * t;
  vec2 cell = floor( g );
  float h1 = waterHash( cell );
  if ( h1 >= ${glslFloat(WATER.glint.share)} ) return 0.0;
  float h2 = waterHash( cell + 19.19 );
  float s = h1 / ${glslFloat(WATER.glint.share)};
  vec2 d = g - cell - 0.5 - ( vec2( s, h2 ) - 0.5 ) * 0.5;
  vec2 size = max( vec2( ${glslFloat(WATER.glint.len)}, ${glslFloat(WATER.glint.wid)} ), vec2( px ) );
  vec2 axis = ${glslVec(WATER.glint.axis)};
  vec2 e = vec2( dot( d, axis ), dot( d, vec2( -axis.y, axis.x ) ) ) / size;
  float shape = max( 1.0 - dot( e, e ), 0.0 ) * sqrt( ${glslFloat(WATER.glint.len * WATER.glint.wid)} / ( size.x * size.y ) );
  float twinkle = 0.5 + 0.5 * sin( t * ( ${glslFloat(WATER.glint.twinkleMin)} + ${glslFloat(WATER.glint.twinkleRange)} * h2 ) + ${glslFloat(TAU)} * s );
  return shape * smoothstep( ${glslFloat(WATER.glint.twinkleFrom)}, 1.0, twinkle );
}
float waterCaustic( vec2 p, float t, float aa ) {
  vec2 q = p * ${glslFloat(WATER.pool.scale)};
  float a = sin( q.x + 0.6 * t + 1.3 * sin( 0.9 * q.y - 0.4 * t ) );
  float b = sin( q.y - 0.5 * t + 1.3 * sin( 1.1 * q.x + 0.35 * t ) );
  return 1.0 - smoothstep( 0.0, ${glslFloat(WATER.pool.width)} + aa, abs( a + b ) );
}
`;

/**
 * After `color_fragment` in the body material: the water look (see WATER and waterLight). The world
 * position comes from the view-space one (the view matrix is a rotation and a shift, so its
 * rotation's transpose undoes it); its pixel footprint is taken here, outside any branch.
 */
export const WATER_FRAGMENT = /* glsl */ `
vec2 waterXZ = ( cameraPosition - vViewPosition * mat3( viewMatrix ) ).xz;
float waterPx = max( fwidth( waterXZ.x ), fwidth( waterXZ.y ) );
int waterKind = int( vAnim.x + 0.5 );
if ( waterKind == ${MOTION_CODE.pond} || waterKind == ${MOTION_CODE.pool} ) {
  float waterT = uTime * uMotion * vAnim.z;
  float waterAa = ${glslFloat(WATER.band.slope)} * waterPx;
  float waterBand = smoothstep( ${glslFloat(WATER.band.from)} - waterAa, ${glslFloat(WATER.band.to)} + waterAa, waterSwell( waterXZ, waterT ) );
  diffuseColor.rgb = mix( diffuseColor.rgb, ${glslVec(WATER.band.colour)},
    clamp( waterBand * ${glslFloat(WATER.band.mix)} * vAnim.y * ( 1.0 - ${glslFloat(WATER.band.nightFade)} * uNight ), 0.0, 1.0 ) );
  diffuseColor.rgb *= 1.0 - ( waterKind == ${MOTION_CODE.pond} ? ${glslFloat(WATER.nightDim.pond)} : ${glslFloat(WATER.nightDim.pool)} ) * uNight;
  if ( waterKind == ${MOTION_CODE.pond} ) {
    float glint = waterGlint( waterXZ, waterT, waterPx / ${glslFloat(WATER.glint.cell)} );
    totalEmissiveRadiance += ${glslVec(WATER.glint.colour)} * ( glint * ${glslFloat(WATER.glint.power)} * uMoon * vAnim.y );
  } else {
    float shimmer = waterCaustic( waterXZ, waterT, ${glslFloat(WATER.pool.slope)} * waterPx );
    totalEmissiveRadiance += ${glslVec(WATER.pool.colour)}
      * ( ( ${glslFloat(WATER.pool.base)} + ${glslFloat(WATER.pool.shimmer)} * shimmer ) * uNight * vAnim.y );
  }
}
`;

/** Add the water look to the body material's fragment shader (call after patchMotionShader). */
export function patchWaterShader(s: PatchableShader): void {
  const hook = '#include <color_fragment>';
  if (!s.fragmentShader.includes(hook)) throw new Error(`water shader: three's shader has no ${hook} to hook into`);
  s.fragmentShader = WATER_FRAGMENT_PARS + s.fragmentShader.replace(hook, `${hook}\n${WATER_FRAGMENT}`);
}

export interface PatchableShader { uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string }

/** The vertex chunks the patch hooks into, in shader order (project_vertex: the move must come before it). */
const HOOKS = ['beginnormal_vertex', 'begin_vertex', 'project_vertex', 'worldpos_vertex'] as const;
const include = (chunk: (typeof HOOKS)[number]) => `#include <${chunk}>`;

/** Add item motion to a MeshStandardMaterial shader (call from onBeforeCompile). */
export function patchMotionShader(s: PatchableShader): void {
  for (const chunk of HOOKS) {
    if (!s.vertexShader.includes(include(chunk))) throw new Error(`motion shader: three's shader has no ${include(chunk)} to hook into`);
  }
  Object.assign(s.uniforms, motionUniforms);
  s.vertexShader = MOTION_VERTEX_PARS + s.vertexShader
    .replace(include('beginnormal_vertex'), `${include('beginnormal_vertex')}\n${MOTION_VERTEX_SETUP}`)
    .replace(include('begin_vertex'), `${include('begin_vertex')}\n${MOTION_VERTEX_APPLY}`)
    .replace(include('worldpos_vertex'), `${MOTION_VERTEX_REST}\n${include('worldpos_vertex')}`);
  s.fragmentShader = MOTION_FRAGMENT_PARS + s.fragmentShader;
}
