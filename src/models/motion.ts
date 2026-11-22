import type * as THREE from 'three';
import type { Vec3 } from './kit';

/**
 * GPU item animation. Every kit part carries three per-vertex attributes (all zero = still):
 *   anim  vec4  (kind code, amount, speed, phase offset)
 *   pivot vec3  the point the motion is about, in item space (a position: placements move it)
 *   axis  vec3  the motion's direction, unit length (a direction: placements turn it)
 * The two kit materials read them in their vertex shader with the shared `motionUniforms`, so
 * swaying, waving, spinning and swinging cost no draw calls and no per-frame CPU work. Shadows
 * stay static: the shadow map is drawn with three's own depth material (the rest pose), and
 * moving surfaces look their shadows up where their rest pose is.
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
  /** sway: lean per unit of height; wave: sideways ripple per unit of cloth; swing: max angle (radians); spin: unused. */
  amount?: number;
  /** Radians per second: spin's turn rate (negative turns the other way), the others' rhythm. */
  speed?: number;
  /** Extra phase in radians (parts of one item out of step); each placed item also gets its own. */
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
export type LightKind = 'steady' | 'breathe' | 'blink' | 'window';
export const LIGHT_CODE = { steady: 0, breathe: 1, blink: 2, window: 3 } as const;
export const LIGHT_STRIDE = 8;
/** Breathe: 0.65..1.0 over 3 s. Blink: 1.4 s a cycle (on 55 %, dim 0.1 when off). Window: steady ±15 %. */
export const BREATHE_PERIOD = 3;
export const BLINK_PERIOD = 1.4;
export const BLINK_ON = 0.55;
export const BLINK_OFF_LEVEL = 0.1;
export const WINDOW_VARIATION = 0.15;
/** Hard upper bound on any pattern's on/off-or-peak rate, in Hz (a safety limit, not a speed). */
export const LIGHT_MAX_HZ = 3;

/**
 * Glow multiplier of a light pattern: the same maths as the vertex shader (MOTION_VERTEX_SETUP).
 * `phase` is the part's phase (its own plus the item's); `motion` is `uMotion` (0 holds 1.0).
 */
export function lightPattern(kind: LightKind, time: number, phase: number, motion = 1): number {
  if (!(motion > 0) || kind === 'steady') return 1;
  const tau = Math.PI * 2;
  const frac = (x: number) => x - Math.floor(x);
  if (kind === 'breathe') return 0.825 + 0.175 * Math.sin((tau * time) / BREATHE_PERIOD + phase);
  if (kind === 'blink') return frac(time / BLINK_PERIOD + phase / tau) < BLINK_ON ? 1 : BLINK_OFF_LEVEL;
  return 1 + WINDOW_VARIATION * (2 * frac(phase / tau) - 1);
}

/** The packed `anim.x` of a motion code and a light kind. */
export function packLight(motionCode: number, light: LightKind): number {
  const code = LIGHT_CODE[light];
  if (code === undefined) throw new Error(`style kit: unknown light "${String(light)}" (steady, breathe, blink or window)`);
  return motionCode + LIGHT_STRIDE * code;
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
  const finite = (v: number, what: string) => {
    if (!Number.isFinite(v)) throw new Error(`style kit: motion ${what} must be a finite number (got ${v})`);
    return v;
  };
  const amount = finite(m.amount ?? defaults.amount, 'amount');
  const speed = finite(m.speed ?? defaults.speed, 'speed');
  const phase = finite(m.phase ?? 0, 'phase');
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
};

export function advanceMotion(dtMs: number): void {
  if (Number.isFinite(dtMs) && dtMs > 0) motionUniforms.uTime.value += dtMs / 1000;
}

export function setWind(w: number): void {
  motionUniforms.uWind.value = Math.min(4, Math.max(0, w));
}

export function setNight(n: number): void {
  motionUniforms.uNight.value = Math.min(1, Math.max(0, n));
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

/** Rest pose at time 0 (a thumbnail must not bake a random moment); call the result to restore. */
export function freezeMotion(): () => void {
  const { uTime, uMotion } = motionUniforms;
  const saved = { time: uTime.value, motion: uMotion.value };
  uTime.value = 0;
  uMotion.value = 0;
  return () => {
    uTime.value = saved.time;
    uMotion.value = saved.motion;
  };
}

/**
 * World wind direction (mostly across the default view, which looks from +x/+z, so a sway reads as
 * a sideways lean). Not normalised here; the shader does.
 */
const WIND_DIR = 'vec3( 1.0, 0.0, -0.75 )';

/** Prepended to the vertex shader: attributes, uniforms, the fragment flag and helpers. */
export const MOTION_VERTEX_PARS = /* glsl */ `
attribute vec4 anim;
attribute vec3 pivot;
attribute vec3 axis;
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
 * After `beginnormal_vertex`: work out this vertex's motion (a rotation about the pivot and a
 * shift) and turn the normal with it. Positions here are in object space: the world for merged
 * chunks, the item for gallery models; the item's phase comes from its pivot in the world.
 */
export const MOTION_VERTEX_SETUP = /* glsl */ `
int motionPacked = int( anim.x + 0.5 );
int lightCode = motionPacked / ${LIGHT_STRIDE};
int motionKind = motionPacked - ${LIGHT_STRIDE} * lightCode;
float motionPhase = anim.w + 6.2831853 * motionHash( ( modelMatrix * vec4( pivot, 1.0 ) ).xz );
vAnim = vec4( float( motionKind ), anim.yz, motionPhase );
// glow light pattern (mirrors lightPattern in this file); steady and reduced motion hold 1.0
vLight = 1.0;
if ( uMotion > 0.0 ) {
  if ( lightCode == ${LIGHT_CODE.breathe} ) vLight = 0.825 + 0.175 * sin( 6.2831853 * uTime / ${BREATHE_PERIOD.toFixed(1)} + motionPhase );
  else if ( lightCode == ${LIGHT_CODE.blink} ) vLight = fract( uTime / ${BLINK_PERIOD.toFixed(2)} + motionPhase / 6.2831853 ) < ${BLINK_ON.toFixed(2)} ? 1.0 : ${BLINK_OFF_LEVEL.toFixed(2)};
  else if ( lightCode == ${LIGHT_CODE.window} ) vLight = 1.0 + ${WINDOW_VARIATION.toFixed(2)} * ( 2.0 * fract( motionPhase / 6.2831853 ) - 1.0 );
}
bool motionMoves = uMotion > 0.0 && motionKind >= ${MOTION_CODE.sway} && motionKind <= ${MOTION_CODE.swing};
mat3 motionRot = mat3( 1.0 );
vec3 motionShift = vec3( 0.0 );
if ( motionMoves ) {
  float motionT = uTime * anim.z + motionPhase;
  vec3 motionRel = position - pivot;
  if ( motionKind == ${MOTION_CODE.sway} ) {
    // lean downwind in proportion to the height above the pivot; rain leans further
    vec3 wind = normalize( ( vec4( ${WIND_DIR}, 0.0 ) * modelMatrix ).xyz ); // world -> object (rotation)
    float lean = 0.8 * sin( motionT ) + 0.2 * sin( 2.3 * motionT + 1.7 ) + 0.5 * max( uWind - 1.0, 0.0 );
    motionShift = wind * ( anim.y * uWind * uMotion * lean * max( dot( motionRel, axis ), 0.0 ) );
  } else if ( motionKind == ${MOTION_CODE.wave} ) {
    // a ripple running out along the cloth from the pole, growing towards the free edge
    float along = max( dot( motionRel, axis ), 0.0 );
    vec3 side = cross( axis, vec3( 0.0, 1.0, 0.0 ) );
    side = dot( side, side ) > 1e-6 ? normalize( side ) : vec3( 0.0, 0.0, 1.0 );
    motionShift = side * ( anim.y * uMotion * min( uWind, 2.0 ) * along * sin( motionT - 7.0 * along ) );
  } else if ( motionKind == ${MOTION_CODE.spin} ) {
    motionRot = motionRotation( axis, uMotion * motionT );
  } else if ( motionKind == ${MOTION_CODE.swing} ) {
    motionRot = motionRotation( axis, uMotion * anim.y * sin( motionT ) );
  }
  objectNormal = motionRot * objectNormal;
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
varying vec4 vAnim;
varying float vLight;
`;

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
