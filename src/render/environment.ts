import * as THREE from 'three';
import { nextRandom } from '../game/rng';
import { GRID_SIZE, type QualityTier, type SceneSettings, type TimeId, type WeatherId } from '../game/types';
import type { StyleKit } from '../models/kit';
import { SURROUND_FADE } from './ground';
import { setShadowTier, type Stage } from './stage';

type Vec3 = [number, number, number];

export interface EnvPreset {
  sky: number; fog: number; fogNear: number; fogFar: number;
  hemiSky: number; hemiGround: number; hemiIntensity: number;
  sunColor: number; sunIntensity: number; sunDir: Vec3;
  glowStrength: number; stars: boolean;
}

type BasePreset = Omit<EnvPreset, 'glowStrength' | 'stars'>;

/**
 * Sunny looks per time of day. `sky` is the colour overhead, `fog` the colour at the horizon (the
 * far ground fades into it). `sunDir` points from the map towards the sun (or moon at night); the
 * default camera looks from +x/+z, so a sun from +z lights the faces kids see first.
 */
const SUNNY: Record<TimeId, BasePreset> = {
  dawn: {
    sky: 0x9ab8f0, fog: 0xffd6cc, fogNear: 30, fogFar: 74,
    hemiSky: 0xeedcf8, hemiGround: 0xa08caa, hemiIntensity: 1.05,
    sunColor: 0xffcaa4, sunIntensity: 1.4, sunDir: [-0.85, 0.45, 0.4],
  },
  day: {
    sky: 0x58b4f4, fog: 0xc9e9fc, fogNear: 32, fogFar: 84,
    hemiSky: 0xe4f2ff, hemiGround: 0xc8b890, hemiIntensity: 1.0,
    sunColor: 0xfff2da, sunIntensity: 1.65, sunDir: [-0.35, 0.82, 0.45],
  },
  dusk: {
    sky: 0x7a6cc4, fog: 0xffb89a, fogNear: 30, fogFar: 72,
    hemiSky: 0xdab6ee, hemiGround: 0x7d6294, hemiIntensity: 1.1,
    sunColor: 0xffb27c, sunIntensity: 1.5, sunDir: [0.9, 0.55, 0.15],
  },
  night: {
    sky: 0x121a44, fog: 0x2b3874, fogNear: 30, fogFar: 70,
    hemiSky: 0x5f6fd8, hemiGround: 0x2e2a52, hemiIntensity: 0.9,
    sunColor: 0xaab8ff, sunIntensity: 0.8, sunDir: [0.3, 0.85, 0.5],
  },
};

const GLOW: Record<TimeId, number> = { dawn: 0.3, day: 0, dusk: 0.6, night: 1 };
const RAIN_SUN = 0.5;
const RAIN_HEMI = 0.7;
const RAIN_FOG_FAR = 0.6;

/** Pull a colour towards its own grey and darken it a little (rain clouds). */
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

/** Lighting, sky and fog for one time × weather. Pure; returns a fresh object. */
export function envPreset(time: TimeId, weather: WeatherId): EnvPreset {
  const base = SUNNY[time];
  const p: EnvPreset = {
    ...base, sunDir: normalize(base.sunDir), glowStrength: GLOW[time],
    stars: time === 'night' && weather === 'sunny', // rain clouds hide them
  };
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
const SUN_DISTANCE = 30;
const SKY_RADIUS = 150;
const STAR_COUNT = 1400;
const RAIN = { pretty: 2500, smooth: 500, speed: 18, width: 14, height: 12, depth: 14 } as const;

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
  // the map its line of sight meets the ground: hidden over the green, showing where the ground has
  // melted into the sky (same band as the surround's own fade).
  material.onBeforeCompile = (s) => {
    s.vertexShader = 'varying float vStarFade;\n' + s.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec3 starDir = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz - cameraPosition;
      vStarFade = 1.0;
      if ( starDir.y < 0.0 ) {
        vec2 hit = cameraPosition.xz + starDir.xz * ( ( ${SURROUND_FADE.y.toFixed(2)} - cameraPosition.y ) / starDir.y );
        vStarFade = smoothstep( ${SURROUND_FADE.start.toFixed(1)}, ${SURROUND_FADE.end.toFixed(1)}, distance( hit, vec2( ${CENTER.x.toFixed(1)}, ${CENTER.z.toFixed(1)} ) ) );
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
 * Lights, sky dome, stars, fog and rain. Call `apply` whenever the settings *or the quality tier*
 * change: the smooth tier's fog colour and the rain density depend on the tier.
 */
export function createEnvironment(stage: Stage, kit: StyleKit): { apply(s: SceneSettings, q: QualityTier): void } {
  const { scene } = stage;

  const hemi = new THREE.HemisphereLight();
  const sun = new THREE.DirectionalLight();
  sun.castShadow = true;
  sun.shadow.intensity = 0.8; // soft, friendly shadows rather than black ones
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const shadowCam = sun.shadow.camera;
  shadowCam.left = -8.5; shadowCam.right = 8.5; shadowCam.top = 8.5; shadowCam.bottom = -8.5;
  shadowCam.near = 1; shadowCam.far = SUN_DISTANCE * 2.2;
  shadowCam.updateProjectionMatrix();
  sun.target.position.copy(CENTER);

  const fog = new THREE.Fog(0xffffff, 30, 80);
  const sky = createSky();
  const stars = createStars();
  const rain = createRain();

  scene.add(hemi, sun, sun.target, sky.mesh, stars, rain.lines);
  scene.fog = fog;
  stage.onFrame((dt) => rain.update(dt));

  const linear = new THREE.Color();
  return {
    apply(s, q) {
      const p = envPreset(s.time, s.weather);
      hemi.color.setHex(p.hemiSky);
      hemi.groundColor.setHex(p.hemiGround);
      hemi.intensity = p.hemiIntensity;
      sun.color.setHex(p.sunColor);
      sun.intensity = p.sunIntensity;
      sun.position.set(...p.sunDir).multiplyScalar(SUN_DISTANCE).add(CENTER);
      setShadowTier(sun.shadow, q);

      linear.setHex(p.fog);
      if (q === 'smooth') linear.setRGB(...acesFilmic([linear.r, linear.g, linear.b], stage.renderer.toneMappingExposure));
      fog.color.copy(linear);
      fog.near = p.fogNear;
      fog.far = p.fogFar;
      sky.set(p.sky, p.fog);
      stars.visible = p.stars;
      rain.set(s.weather === 'rain', q, greyed(p.hemiSky, 0.45, 0.9)); // drops pick up the sky light, softened
      kit.setGlowStrength(p.glowStrength);
    },
  };
}
