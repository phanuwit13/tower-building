import * as THREE from 'three';
import { nextRandom } from '../game/rng';
import { clampNightGlow } from '../themes/types';
import { GRID_SIZE, type QualityTier, type SceneSettings, type TimeId, type WeatherId } from '../game/types';
import type { StyleKit } from '../models/kit';
import { glslFloat, setMoon, setNight, setWind } from '../models/motion';
import { SURROUND_FADE } from './ground';
import { BLOOM, setShadowTier, type BloomSettings, type Stage } from './stage';

type Vec3 = [number, number, number];

export interface EnvPreset {
  sky: number; fog: number; fogNear: number; fogFar: number;
  hemiSky: number; hemiGround: number; hemiIntensity: number;
  sunColor: number; sunIntensity: number; sunDir: Vec3;
  glowStrength: number; stars: boolean;
  /** How much the moon shows, 0..1 (and the moonlight glints on ponds): night 1, dusk and dawn faint, none by day or in rain. */
  moon: number;
  /** The pretty tier's bloom (Stage.setBloom): BLOOM, but a city's dusk and night have their own. */
  bloom: BloomSettings;
}

type BasePreset = Omit<EnvPreset, 'glowStrength' | 'stars' | 'moon' | 'bloom'>;

/**
 * Sunny looks per time of day. `sky` is the colour overhead, `fog` the colour at the horizon (the
 * far ground fades into it). `sunDir` points from the map towards the sun (or moon at night); the
 * default camera looks from +x/+z, so a sun from +z lights the faces kids see first.
 */
/** Fog distances below were tuned on the first, 10 x 10 map and grow with it (the camera sits proportionally further back). */
const MAP_SCALE = GRID_SIZE / 10;
const SUNNY: Record<TimeId, BasePreset> = {
  dawn: {
    sky: 0x9ab8f0, fog: 0xffd6cc, fogNear: 30 * MAP_SCALE, fogFar: 74 * MAP_SCALE,
    hemiSky: 0xeedcf8, hemiGround: 0xa08caa, hemiIntensity: 1.05,
    sunColor: 0xffcaa4, sunIntensity: 1.4, sunDir: [-0.85, 0.45, 0.4],
  },
  day: {
    sky: 0x58b4f4, fog: 0xc9e9fc, fogNear: 32 * MAP_SCALE, fogFar: 84 * MAP_SCALE,
    hemiSky: 0xe4f2ff, hemiGround: 0xc8b890, hemiIntensity: 1.0,
    sunColor: 0xfff2da, sunIntensity: 1.65, sunDir: [-0.35, 0.82, 0.45],
  },
  dusk: {
    sky: 0x7a6cc4, fog: 0xffb89a, fogNear: 30 * MAP_SCALE, fogFar: 72 * MAP_SCALE,
    hemiSky: 0xdab6ee, hemiGround: 0x7d6294, hemiIntensity: 1.1,
    sunColor: 0xffb27c, sunIntensity: 1.5, sunDir: [0.9, 0.55, 0.15],
  },
  night: {
    sky: 0x121a44, fog: 0x2b3874, fogNear: 30 * MAP_SCALE, fogFar: 70 * MAP_SCALE,
    hemiSky: 0x5f6fd8, hemiGround: 0x2e2a52, hemiIntensity: 0.9,
    sunColor: 0xaab8ff, sunIntensity: 0.8, sunDir: [0.3, 0.85, 0.5],
  },
};

const GLOW: Record<TimeId, number> = { dawn: 0.3, day: 0, dusk: 0.6, night: 1 };
/** The moon by time of day (rain clouds hide it): full at night, a pale ghost of it at dusk and dawn. */
const MOON_LIGHT: Record<TimeId, number> = { dawn: 0.35, day: 0, dusk: 0.35, night: 1 };
const RAIN_SUN = 0.5;
const RAIN_HEMI = 0.7;
const RAIN_FOG_FAR = 0.6;
/** Wind strength for item sway and flags (motion.ts): calm 1, rain blows harder. */
const RAIN_WIND = 1.8;

/**
 * A city's night (ThemeDef.nightGlow): street lamps, shop windows and neon light the streets up.
 * The share of a theme's extra night glow each time of day gets: all of it at night, some at dusk
 * (the lights are coming on), none by day or at dawn.
 */
const CITY_NIGHT: Record<TimeId, number> = { dawn: 0, day: 0, dusk: 0.6, night: 1 };
/** Warm street light, added to the sky fill and to the haze at the horizon (city light pollution). */
const CITY_LIGHT = 0xffb878;
/**
 * Per unit of lift (nightGlow − 1, times the share above):
 * - `fill`: how much brighter the fill light gets;
 * - `neutral`: how much of the moonlit blue (or dusk's violet) goes out of the fill's colours and,
 *   at night, out of the moonlight, so painted reds, yellows and greens read as themselves (the sky
 *   overhead stays deep blue);
 * - `sky`, `ground`, `haze`: how much city light the fill's sky colour, its ground colour (light
 *   bounced up from the lit street onto building faces) and the horizon pick up;
 * - `glow`: how much stronger glowing parts get, per tier. Smooth has no bloom, so the neon, bulbs
 *   and windows themselves must be brighter to pop; pretty's bloom spreads them, so less there;
 * - `bloom`: how far the pretty tier's bloom settings drop. At the standard threshold only pale
 *   lights (warm windows and bulbs) bloom: saturated neon (red, teal, purple, blue) is too dark to
 *   pass it, so a city's night glowed warm yellow, not in colour. Lowered, every glowing part
 *   blooms in its own colour; a softer (strength), tighter (radius) bloom keeps the many windows
 *   from washing the whole map out to white.
 */
const CITY = {
  fill: 1.6, neutral: 1, sky: 0.4, ground: 0.9, haze: 0.24,
  glow: { smooth: 1.2, pretty: 0.8 } satisfies Record<QualityTier, number>,
  bloom: { threshold: 0.6, strength: 0.3, radius: 0.4 } satisfies BloomSettings,
} as const;
/**
 * The lowest a city's bloom threshold goes. At night lit walls and roofs stay well under it (none
 * bloomed even at 0.4); in dusk's sun they reach about 0.5, which the dusk threshold stays above.
 */
export const CITY_BLOOM_FLOOR = 0.55;

/** `hex` with `t` of `light` added, per channel (light only adds: never darker). */
function addLight(hex: number, light: number, t: number): number {
  const ch = (shift: number) => Math.min(255, Math.round(((hex >> shift) & 255) + ((light >> shift) & 255) * t));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Pull a colour `amount` of the way towards its own grey and scale it by `dim` (rain clouds; with `dim` 1, a city's light taking the blue out of its night). */
function greyed(hex: number, amount = 0.7, dim = 0.85): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const ch = (c: number) => Math.round(Math.min(255, (c + (l - c) * amount) * dim));
  return (ch(r) << 16) | (ch(g) << 8) | ch(b);
}

function normalize([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
}

/**
 * Lighting, sky and fog for one time × weather. Pure; returns a fresh object. `nightGlow` is the
 * shown theme's (ThemeDef.nightGlow): above 1, its dusk and night are a lit city's (a brighter,
 * warm-neutral fill light instead of moonlit blue, a glowing horizon, stronger glowing parts, a
 * bloom that lets neon glow in colour); 1 (or less) is the standard look. `tier` only matters to
 * a city's glow (see CITY).
 */
export function envPreset(time: TimeId, weather: WeatherId, nightGlow = 1, tier: QualityTier = 'pretty'): EnvPreset {
  const base = SUNNY[time];
  const p: EnvPreset = {
    ...base, sunDir: normalize(base.sunDir), glowStrength: GLOW[time],
    stars: time === 'night' && weather === 'sunny', // rain clouds hide them
    moon: weather === 'rain' ? 0 : MOON_LIGHT[time],
    bloom: { ...BLOOM },
  };
  const lift = (clampNightGlow(nightGlow) - 1) * CITY_NIGHT[time]; // held to 0–1: nightGlow is held to 1–2 whatever a theme says
  if (lift > 0) {
    const neutral = CITY.neutral * lift;
    p.hemiIntensity *= 1 + CITY.fill * lift;
    p.hemiSky = addLight(greyed(p.hemiSky, neutral, 1), CITY_LIGHT, CITY.sky * lift);
    p.hemiGround = addLight(greyed(p.hemiGround, neutral, 1), CITY_LIGHT, CITY.ground * lift);
    if (time === 'night') p.sunColor = greyed(p.sunColor, neutral, 1); // the moonlight; dusk's setting sun keeps its glow
    p.fog = addLight(p.fog, CITY_LIGHT, CITY.haze * lift);
    p.glowStrength *= 1 + CITY.glow[tier] * lift;
    p.bloom = {
      threshold: Math.max(CITY_BLOOM_FLOOR, BLOOM.threshold - CITY.bloom.threshold * lift),
      strength: BLOOM.strength - CITY.bloom.strength * lift,
      radius: BLOOM.radius - CITY.bloom.radius * lift,
    };
  }
  if (weather === 'rain') {
    p.sky = greyed(p.sky);
    p.fog = greyed(p.fog);
    p.sunIntensity *= RAIN_SUN;
    p.hemiIntensity *= RAIN_HEMI;
    p.fogFar *= RAIN_FOG_FAR;
  }
  return p;
}

/**
 * CPU copy of three's ACESFilmicToneMapping: linear RGB in, linear RGB out.
 * Without post-processing, fog colour is mixed in *after* tone mapping, so the smooth tier feeds
 * the fog a pre-tone-mapped colour to fade into exactly the same horizon as the pretty tier.
 */
export function acesFilmic([r, g, b]: Vec3, exposure = 1): Vec3 {
  const k = exposure / 0.6;
  r *= k; g *= k; b *= k;
  const fit = (v: number) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
  const fr = fit(0.59719 * r + 0.35458 * g + 0.04823 * b);
  const fg = fit(0.076 * r + 0.90834 * g + 0.01566 * b);
  const fb = fit(0.0284 * r + 0.13383 * g + 0.83777 * b);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clamp(1.60475 * fr - 0.53108 * fg - 0.07367 * fb),
    clamp(-0.10208 * fr + 1.10813 * fg - 0.00605 * fb),
    clamp(-0.00327 * fr - 0.07276 * fg + 1.07602 * fb),
  ];
}

const CENTER = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);
/**
 * The moon and stars belong to the sky: each shows only where its line of sight meets the ground
 * past this distance from the map centre, where the surround has all but melted into the sky colour
 * (its fade runs SURROUND_FADE.start → end). Over land that still reads as ground they are hidden.
 */
export const SKY_FROM = SURROUND_FADE.start + 0.8 * (SURROUND_FADE.end - SURROUND_FADE.start);
const SUN_DISTANCE = 3 * GRID_SIZE;
/** The sun's shadow camera spans the map's corners (half-diagonal 0.71 * GRID_SIZE) with a margin for tall items. */
const SHADOW_HALF = 0.85 * GRID_SIZE;
const SKY_RADIUS = 150;
const STAR_COUNT = 1400;
/**
 * The rain box is 1.4 x the map on each side (as the 10 x 10 map's was); drops per volume are the
 * same as then for pretty (2500 drops in 14 x 14 x 12), so its count grows with the box's floor area.
 * Smooth is a fixed 800 (was 500): sparse rain, cheap on a low-end Chromebook.
 */
const RAIN_SIDE = 1.4 * GRID_SIZE;
const RAIN_AREA_SCALE = (RAIN_SIDE / 14) ** 2;
const RAIN = {
  pretty: Math.round(2500 * RAIN_AREA_SCALE), smooth: 800, // smooth stays sparse and cheap: a fixed count, not scaled by map area
  speed: 18, width: RAIN_SIDE, height: 12, depth: RAIN_SIDE,
} as const;

/**
 * Gradient sky dome: below the horizon = fog colour (so it meets the faded ground with no seam),
 * overhead = sky colour. Tone-mapped like the scene in both tiers.
 */
function createSky() {
  const material = new THREE.ShaderMaterial({
    uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vDir = world.xyz - cameraPosition;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top;
      uniform vec3 bottom;
      varying vec3 vDir;
      void main() {
        float h = smoothstep(0.0, 0.55, normalize(vDir).y);
        gl_FragColor = vec4(mix(bottom, top, h), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(SKY_RADIUS, 32, 16), material);
  mesh.position.copy(CENTER);
  mesh.renderOrder = -2; // drawn first, behind everything (then the surround, see ground.ts)
  return {
    mesh,
    set(sky: number, horizon: number) {
      material.uniforms.top.value.setHex(sky);
      material.uniforms.bottom.value.setHex(horizon);
    },
  };
}

/**
 * The moon: a disc with a soft halo, at infinity (it is drawn `distance` from the camera, always in
 * direction `dir`, so panning never moves it and orbiting slides it like the stars). Radii are
 * angles in radians: the disc is about 46 px across on an 800 px tall view.
 *
 * Where: on the night light's compass line, on the far side of the map. The night light comes from
 * behind the default camera so that it lights the faces kids see; a moon on the light's own side
 * would never be in view. It hangs low in the sky just above the far land: the steep default view
 * (its top is 37° below the horizon) shows no sky and so no moon; tilt the camera down towards the
 * horizon and it rises over the far side of the city. Like the stars it is hidden wherever its line
 * of sight meets the ground before the ground has melted into the sky (zoomed right in, the land
 * covers it), and it is drawn behind the map and every item.
 */
const MOON_ELEVATION = -0.105; // radians: about 6° below the true horizon, which is above the far land the camera sees
const NIGHT_LIGHT = normalize(SUNNY.night.sunDir);
const NIGHT_LIGHT_FLAT = Math.hypot(NIGHT_LIGHT[0], NIGHT_LIGHT[2]);
export const MOON = {
  dir: [
    (-NIGHT_LIGHT[0] / NIGHT_LIGHT_FLAT) * Math.cos(MOON_ELEVATION),
    Math.sin(MOON_ELEVATION),
    (-NIGHT_LIGHT[2] / NIGHT_LIGHT_FLAT) * Math.cos(MOON_ELEVATION),
  ] as Vec3,
  discRadius: 0.021,
  haloRadius: 0.076,
  distance: 200, // past the whole map at the furthest zoom, inside the camera's far plane (300)
} as const;
/** Smooth has no bloom, so the moon draws its whole halo; on pretty, bloom makes most of it. */
const MOON_HALO: Record<QualityTier, number> = { smooth: 1, pretty: 0.35 };
/**
 * The disc's brightness: pretty's bloom would turn anything brighter than this into a flat white
 * blob (the seas must show). Under a lowered bloom threshold (a city's night) it dims to match.
 */
const MOON_FACE: Record<QualityTier, number> = { smooth: 0.95, pretty: 0.62 };

/**
 * One camera-facing quad (one draw call, and only while the moon shows). Its colour is
 * premultiplied: the disc covers what is behind it, the halo only adds light. Not fogged, casts no
 * shadow; the disc is bright enough for the pretty tier's bloom.
 */
function createMoon() {
  const ratio = MOON.haloRadius / MOON.discRadius; // quad half-size, in disc radii
  const f = glslFloat;
  const material = new THREE.ShaderMaterial({
    uniforms: { visibility: { value: 0 }, halo: { value: 1 }, faceGain: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vQuad;
      varying float vLand;
      void main() {
        vQuad = position.xy;
        // hidden where the land is still in front of it (see SKY_FROM; the stars do the same)
        vec3 moonDir = vec3( ${MOON.dir.map(f).join(', ')} );
        vec2 landHit = cameraPosition.xz + moonDir.xz * ( ( ${f(SURROUND_FADE.y)} - cameraPosition.y ) / moonDir.y );
        vLand = moonDir.y < 0.0 ? smoothstep( ${f(SKY_FROM)}, ${f(SURROUND_FADE.end)}, distance( landHit, vec2( ${f(CENTER.x)}, ${f(CENTER.z)} ) ) ) : 1.0;
        vec4 centre = viewMatrix * vec4( cameraPosition + moonDir * ${f(MOON.distance)}, 1.0 );
        centre.xy += position.xy * ${f(MOON.distance * Math.tan(MOON.haloRadius))};
        gl_Position = projectionMatrix * centre;
      }`,
    fragmentShader: /* glsl */ `
      uniform float visibility;
      uniform float halo;
      uniform float faceGain;
      varying vec2 vQuad;
      varying float vLand;
      float moonSpot( vec2 q, vec2 c, float r ) { return 1.0 - smoothstep( 0.4 * r, r, length( q - c ) ); }
      void main() {
        vec2 q = vQuad * ${f(ratio)}; // disc radii: the rim is at 1
        float r = length( q );
        float aa = fwidth( r );
        float disc = 1.0 - smoothstep( 1.0 - aa, 1.0 + aa, r );
        // a friendly full moon: cream, a touch darker at the rim, three soft grey seas
        float seas = moonSpot( q, vec2( -0.32, 0.22 ), 0.36 ) + moonSpot( q, vec2( 0.3, 0.32 ), 0.22 ) + moonSpot( q, vec2( 0.12, -0.38 ), 0.26 );
        vec3 face = vec3( 1.0, 0.958, 0.81 ) * faceGain * ( 1.0 - 0.16 * min( seas, 1.0 ) ) * ( 0.88 + 0.12 * sqrt( max( 1.0 - r * r, 0.0 ) ) );
        float glow = halo * 0.34 * exp( -1.6 * max( r - 1.0, 0.0 ) ) * ( 1.0 - smoothstep( ${f(0.55 * ratio)}, ${f(ratio)}, r ) );
        gl_FragColor = vec4( mix( vec3( 0.66, 0.68, 0.82 ) * glow, face, disc ), 1.0 );
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor = vec4( gl_FragColor.rgb * visibility * vLand, disc * visibility * vLand );
      }`,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.name = 'moon';
  mesh.frustumCulled = false; // placed by its shader, not by its geometry
  mesh.renderOrder = -1; // the first of the see-through things: everything nearer draws over it (the stars skip its face, see createStars)
  mesh.visible = false;
  let on = false;
  return {
    mesh,
    /** `bloomShare`: the pretty tier's bloom threshold as a share of the standard one (1 unless a city lowers it). */
    set(visibility: number, q: QualityTier, bloomShare = 1) {
      on = visibility > 0;
      mesh.visible = on;
      material.uniforms.visibility.value = visibility;
      material.uniforms.halo.value = MOON_HALO[q];
      material.uniforms.faceGain.value = MOON_FACE[q] * (q === 'pretty' ? bloomShare : 1);
    },
    /** Before each scene render: an override pass (the pretty tier's AO normals) leaves the sky picture out. */
    beforeRender(scene: THREE.Scene) {
      mesh.visible = on && scene.overrideMaterial === null;
    },
  };
}

function createStars(): THREE.Points {
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  let state = 0x5eed5;
  const rand = () => { const r = nextRandom(state); state = r.state; return r.value; };
  const radius = SKY_RADIUS * 0.9;
  for (let i = 0; i < STAR_COUNT; i++) {
    // Uniform over the whole sphere: the camera mostly looks down, so the night sky kids see is the
    // backdrop around the map island (the ground hides the stars beneath it).
    const y = 2 * rand() - 1;
    const ring = Math.sqrt(1 - y * y);
    const a = rand() * Math.PI * 2;
    positions.set([CENTER.x + Math.cos(a) * ring * radius, y * radius, CENTER.z + Math.sin(a) * ring * radius], i * 3);
    const v = 0.65 + 0.35 * rand();
    colors.set([v, v, v * 0.95 + 0.05], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 2.5, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false,
  });
  // The surround plane writes no depth, so stars can sit behind it. Fade each star by how far from
  // the map its line of sight meets the ground: hidden over the land, showing only where the ground
  // has melted into the sky (SKY_FROM → the end of the surround's fade), like the moon.
  material.onBeforeCompile = (s) => {
    s.vertexShader = 'varying float vStarFade;\n' + s.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec3 starDir = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz - cameraPosition;
      // no star shows through the moon's face (it is drawn before them): fade the ones in line with it
      float moonCos = dot( normalize( starDir ), vec3( ${MOON.dir.map(glslFloat).join(', ')} ) );
      vStarFade = 1.0 - smoothstep( ${glslFloat(Math.cos(MOON.discRadius * 1.5))}, ${glslFloat(Math.cos(MOON.discRadius * 1.1))}, moonCos );
      if ( starDir.y < 0.0 ) {
        vec2 hit = cameraPosition.xz + starDir.xz * ( ( ${SURROUND_FADE.y.toFixed(2)} - cameraPosition.y ) / starDir.y );
        vStarFade *= smoothstep( ${glslFloat(SKY_FROM)}, ${glslFloat(SURROUND_FADE.end)}, distance( hit, vec2( ${CENTER.x.toFixed(1)}, ${CENTER.z.toFixed(1)} ) ) );
      }`);
    s.fragmentShader = 'varying float vStarFade;\n' + s.fragmentShader.replace(
      '#include <color_fragment>',
      '#include <color_fragment>\ndiffuseColor.a *= vStarFade;');
  };
  return new THREE.Points(geometry, material);
}

/**
 * Rain: line segments whose fall is done in the vertex shader (no per-frame buffer upload).
 * Both ends of a drop share one position; `aTail` lowers the tail end, and `uFall` scrolls every
 * drop down, wrapping inside the box so drops never stretch across it.
 */
function createRain() {
  const positions = new Float32Array(RAIN.pretty * 6);
  const tails = new Float32Array(RAIN.pretty * 2);
  let state = 0x7a1d;
  const rand = () => { const r = nextRandom(state); state = r.state; return r.value; };
  for (let i = 0; i < RAIN.pretty; i++) {
    const x = CENTER.x + (rand() - 0.5) * RAIN.width;
    const y = rand() * RAIN.height;
    const z = CENTER.z + (rand() - 0.5) * RAIN.depth;
    positions.set([x, y, z, x, y, z], i * 6);
    tails[i * 2 + 1] = 0.3 + 0.25 * rand();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aTail', new THREE.BufferAttribute(tails, 1));
  const fall = { value: 0 };
  const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.32, depthWrite: false });
  material.onBeforeCompile = (s) => {
    s.uniforms.uFall = fall;
    s.vertexShader = 'uniform float uFall;\nattribute float aTail;\n' + s.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3( position );\ntransformed.y = mod( position.y - uFall, ${RAIN.height.toFixed(1)} ) - aTail;`);
  };
  const lines = new THREE.LineSegments(geometry, material);
  lines.frustumCulled = false;
  lines.visible = false;
  return {
    lines,
    update(dtMs: number) {
      if (lines.visible) fall.value = (fall.value + (RAIN.speed * dtMs) / 1000) % RAIN.height;
    },
    set(on: boolean, q: QualityTier, tint: number) {
      lines.visible = on;
      geometry.setDrawRange(0, RAIN[q] * 2);
      material.color.setHex(tint);
    },
  };
}

/**
 * Lights, sky dome, stars, fog and rain. Call `apply` whenever the settings, the quality tier *or
 * the shown theme's night glow* change: the smooth tier's fog colour, the rain density and a city
 * night's glow depend on the tier, a city theme's dusk and night on its `nightGlow` (see envPreset;
 * default 1).
 */
export function createEnvironment(stage: Stage, kit: StyleKit): { apply(s: SceneSettings, q: QualityTier, nightGlow?: number): void } {
  const { scene } = stage;

  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  sun.shadow.intensity = 0.8; // soft, friendly shadows rather than black ones
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const shadowCam = sun.shadow.camera;
  shadowCam.left = -SHADOW_HALF; shadowCam.right = SHADOW_HALF; shadowCam.top = SHADOW_HALF; shadowCam.bottom = -SHADOW_HALF;
  shadowCam.near = 1; shadowCam.far = SUN_DISTANCE * 2.2;
  shadowCam.updateProjectionMatrix();
  sun.target.position.copy(CENTER);

  const fog = new THREE.Fog(0xffffff, 30 * MAP_SCALE, 80 * MAP_SCALE);
  const sky = createSky();
  const stars = createStars();
  const rain = createRain();
  const moon = createMoon();

  scene.add(hemi, sun, sun.target, sky.mesh, stars, moon.mesh, rain.lines);
  scene.fog = fog;
  stage.onFrame((dt) => rain.update(dt));
  // The pretty tier's AO pass re-renders the scene with an override material: keep the moon out of
  // it (no AO halo round a sky picture, and one draw call, not two).
  const sceneBeforeRender = scene.onBeforeRender.bind(scene);
  scene.onBeforeRender = (...args) => {
    sceneBeforeRender(...args);
    moon.beforeRender(scene);
  };

  const linear = new THREE.Color();
  return {
    apply(s, q, nightGlow = 1) {
      const p = envPreset(s.time, s.weather, nightGlow, q);
      hemi.color.setHex(p.hemiSky);
      hemi.groundColor.setHex(p.hemiGround);
      hemi.intensity = p.hemiIntensity;
      sun.color.setHex(p.sunColor);
      sun.intensity = p.sunIntensity;
      sun.position.set(...p.sunDir).multiplyScalar(SUN_DISTANCE).add(CENTER);
      setShadowTier(sun.shadow, q);
      stage.invalidateShadows(); // the sun moved (time of day) or its map was resized (tier)

      linear.setHex(p.fog);
      if (q === 'smooth') linear.setRGB(...acesFilmic([linear.r, linear.g, linear.b], stage.renderer.toneMappingExposure));
      fog.color.copy(linear);
      fog.near = p.fogNear;
      fog.far = p.fogFar;
      sky.set(p.sky, p.fog);
      stars.visible = p.stars;
      moon.set(p.moon, q, p.bloom.threshold / BLOOM.threshold);
      rain.set(s.weather === 'rain', q, greyed(p.hemiSky, 0.45, 0.9)); // drops pick up the sky light, softened
      kit.setGlowStrength(p.glowStrength);
      stage.setBloom(p.bloom); // every apply, so another theme or time puts the standard bloom back
      setWind(s.weather === 'rain' ? RAIN_WIND : 1);
      setNight(GLOW[s.time]); // how night it is: 0 day, 0.3 dawn, 0.6 dusk, 1 night (a city's extra glow does not dim the water more)
      setMoon(p.moon); // moonlight glints on ponds
    },
  };
}
