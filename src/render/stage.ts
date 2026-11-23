import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GRID_SIZE, type QualityTier } from '../game/types';
import { advanceMotion, watchReducedMotion } from '../models/motion';
import { clampPanTarget } from './panClamp';

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  canvas: HTMLCanvasElement;
  setQuality(q: QualityTier): void;
  onFrame(cb: (dtMs: number, nowMs: number) => void): void;
  renderNow(): void;
  /**
   * Re-render the sun's shadow map on the next frame. Shadows are drawn only on change, so call
   * this whenever a shadow caster or the sun changes: placements, time of day, weather, tier.
   */
  invalidateShadows(): void;
  /** Draw calls and triangles of the last animation frame, every pass included (shadow map, AO, bloom). */
  frameStats(): { calls: number; triangles: number };
  /**
   * The pretty tier's bloom (BLOOM unless set). The stage keeps it across tier switches; the
   * environment sets it on every apply (a city's night has its own, see envPreset).
   */
  setBloom(bloom: BloomSettings): void;
  /** Zoom and turn the camera from buttons, the slider and keys (drag, wheel and pinch stay with the controls). */
  rig: CameraRig;
}

/**
 * Camera moves made by the HUD and the keys. Both glide (unless the player prefers reduced motion)
 * and keep the orbit target where it is, so the pan clamp never has anything to undo.
 */
export interface CameraRig {
  /** How far in the view is: 0 = the farthest (maxDistance), 1 = the closest (minDistance), on a log scale. */
  zoom(): number;
  /** Jump to the zoom `share` (clamped to 0..1): the camera slides along its line to the target. */
  setZoom(share: number): void;
  /** Glide the zoom by `step` (a share; negative zooms out). Steps pressed during a glide add up. */
  zoomBy(step: number): void;
  /** Glide the view `rad` about the target's vertical axis (positive: the azimuth grows). Turns pressed during a turn add up. */
  turn(rad: number): void;
  /** Advance the glides to `nowMs`; the stage calls it every frame, before controls.update(). */
  step(nowMs: number): void;
}

/** ⟳ and E turn the view by +TURN_STEP, ⟲ and Q by -TURN_STEP. */
export const TURN_STEP = Math.PI / 4;
/** ＋ / － (buttons and keys) zoom by this share of the slider. */
export const ZOOM_STEP = 0.125;
/** How long a turn and a zoom step glide (reduced motion: no glide). */
export const TURN_MS = 350;
const ZOOM_MS = 200;

/** UnrealBloomPass settings: `threshold` is a luminance measured before exposure. */
export interface BloomSettings { threshold: number; strength: number; radius: number }

interface TierSettings {
  maxPixelRatio: number;
  shadowType: THREE.ShadowMapType;
  shadowSize: number;
  shadowRadius: number;
  postProcessing: boolean;
}

/**
 * Per-tier render settings. three r186 removed PCFSoftShadowMap from WebGLRenderer (it warns and
 * falls back to PCFShadowMap), so the pretty tier gets its soft edges from PCF with a wider
 * sampling radius on a bigger map instead.
 */
const TIERS: Record<QualityTier, TierSettings> = {
  pretty: { maxPixelRatio: 1.5, shadowType: THREE.PCFShadowMap, shadowSize: 4096, shadowRadius: 3, postProcessing: true },
  smooth: { maxPixelRatio: 1, shadowType: THREE.PCFShadowMap, shadowSize: 2048, shadowRadius: 1, postProcessing: false },
};

/** Size a light's shadow map for a tier; a resized map is dropped so three rebuilds it. */
export function setShadowTier(shadow: THREE.LightShadow, q: QualityTier): void {
  const t = TIERS[q];
  shadow.radius = t.shadowRadius;
  if (shadow.mapSize.x === t.shadowSize && shadow.mapSize.y === t.shadowSize) return;
  shadow.mapSize.set(t.shadowSize, t.shadowSize);
  shadow.map?.dispose();
  shadow.map = null;
}

const MAP_CENTER = new THREE.Vector3(GRID_SIZE / 2, 0, GRID_SIZE / 2);

/**
 * Camera limits, all in multiples of the map size so they follow GRID_SIZE. The default view looks
 * from the +x/+z corner (direction 6:13:6) far enough back that the whole map fits a 16:10 screen;
 * zooming in reaches a distance where one 1 x 1 tile is about 150 px on a 768 px tall tablet.
 */
export const CAMERA = {
  fov: 40,
  direction: new THREE.Vector3(6, 13, 6).normalize(),
  distance: GRID_SIZE * 2.05,
  minDistance: 6,
  maxDistance: GRID_SIZE * 2.8,
} as const;
/**
 * Lights are authored dimmer and the exposure raised to match, so lit daytime surfaces stay under
 * the bloom threshold (BLOOM.threshold, measured before exposure) and only glowing parts bloom.
 */
const EXPOSURE = 1.4;
/** The standard bloom: soft halos round glowing parts; lit daytime surfaces stay under its threshold. */
export const BLOOM: Readonly<BloomSettings> = { threshold: 0.85, strength: 0.5, radius: 0.4 };

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/**
 * Pure: the zoom share (0 = `max` away, 1 = `min` away) of a camera `distance` from its target. Log
 * scale: every equal slider step multiplies the distance by the same factor, so zooming feels even.
 */
export function zoomShareOf(distance: number, min: number = CAMERA.minDistance, max: number = CAMERA.maxDistance): number {
  const d = Math.min(Math.max(distance, min), max);
  return clamp01(Math.log(max / d) / Math.log(max / min));
}

/** Pure: the camera distance of a zoom `share` (clamped to 0..1); the inverse of zoomShareOf. */
export function distanceOfShare(share: number, min: number = CAMERA.minDistance, max: number = CAMERA.maxDistance): number {
  return max * (min / max) ** clamp01(share);
}

const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const prefersReducedMotion = (): boolean => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const UP = new THREE.Vector3(0, 1, 0);

export interface CameraRigOptions {
  /** Default: the live `prefers-reduced-motion: reduce` media query. */
  reducedMotion?: () => boolean;
  /** Default: performance.now (the animation loop's clock). */
  now?: () => number;
}

/**
 * The HUD's and the keys' camera moves, on top of OrbitControls. They move the camera only (the
 * target stays), and a hand on the map (the controls' `start`: a press, the wheel, a pinch) stops
 * a glide where it is so the gesture takes over. Instant moves update the controls at once.
 */
export function createCameraRig(
  camera: THREE.PerspectiveCamera, controls: OrbitControls, opts: CameraRigOptions = {},
): CameraRig {
  const reduced = opts.reducedMotion ?? prefersReducedMotion;
  const now = opts.now ?? (() => performance.now());
  const offset = new THREE.Vector3();
  /** The turn in progress: `total` radians from `start`, `done` of them applied so far. */
  let turning: { start: number; total: number; done: number } | null = null;
  let zooming: { start: number; from: number; to: number } | null = null;

  const zoom = (): number => zoomShareOf(controls.getDistance(), controls.minDistance, controls.maxDistance);
  const moveTo = (share: number): void => {
    offset.copy(camera.position).sub(controls.target).setLength(distanceOfShare(share, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);
  };
  const turnBy = (rad: number): void => {
    offset.copy(camera.position).sub(controls.target).applyAxisAngle(UP, rad);
    camera.position.copy(controls.target).add(offset);
  };
  const progress = (start: number, ms: number, t: number): number => clamp01((t - start) / ms);

  controls.addEventListener('start', () => {
    turning = null;
    zooming = null;
  });

  return {
    zoom,
    setZoom(share) {
      zooming = null;
      moveTo(clamp01(share));
      controls.update();
    },
    zoomBy(step) {
      const to = clamp01((zooming?.to ?? zoom()) + step);
      if (reduced()) {
        zooming = null;
        moveTo(to);
        controls.update();
        return;
      }
      zooming = { start: now(), from: zoom(), to };
    },
    turn(rad) {
      const total = rad + (turning ? turning.total - turning.done : 0);
      if (reduced()) {
        turning = null;
        turnBy(total);
        controls.update();
        return;
      }
      turning = { start: now(), total, done: 0 };
    },
    step(t) {
      if (turning) {
        const p = progress(turning.start, TURN_MS, t);
        const done = turning.total * easeInOut(p);
        turnBy(done - turning.done);
        turning.done = done;
        if (p >= 1) turning = null;
      }
      if (zooming) {
        const p = progress(zooming.start, ZOOM_MS, t);
        moveTo(zooming.from + (zooming.to - zooming.from) * easeInOut(p));
        if (p >= 1) zooming = null;
      }
    },
  };
}

/**
 * AO and bloom are soft, low-frequency effects, so they work on a quarter of the composer's pixels
 * (half width × half height; bloom's own mip chain then starts at half of that). Their result is
 * upsampled when blended over the full-resolution image, with no visible loss.
 */
class HalfResGTAOPass extends GTAOPass {
  override setSize(width: number, height: number): void {
    super.setSize(Math.max(1, Math.ceil(width / 2)), Math.max(1, Math.ceil(height / 2)));
  }
}

class HalfResBloomPass extends UnrealBloomPass {
  override setSize(width: number, height: number): void {
    super.setSize(Math.max(1, Math.ceil(width / 2)), Math.max(1, Math.ceil(height / 2)));
  }
}

export function createStage(container: HTMLElement, q: QualityTier): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = EXPOSURE;
  renderer.shadowMap.enabled = true;
  // Placed items never move, so the shadow map is redrawn only when something invalidates it
  // (the scene and AO passes would otherwise redraw it two or three times every frame).
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true; // the first frame
  renderer.info.autoReset = false; // the loop resets it once per frame, so a frame's passes add up
  const canvas = renderer.domElement;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.5, 300);
  camera.position.copy(MAP_CENTER).addScaledVector(CAMERA.direction, CAMERA.distance);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(MAP_CENTER);
  controls.enablePan = true;
  controls.screenSpacePanning = false; // pan slides along the ground, never up or down
  controls.minDistance = CAMERA.minDistance;
  controls.maxDistance = CAMERA.maxDistance;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = 1.25;
  controls.enableDamping = true;
  // Mouse: left orbits, right pans, wheel zooms (OrbitControls defaults). Touch: one finger orbits, two pinch and pan.
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // right-drag pans
  // Keep the target on the map: shift camera and target together so the view slides to a stop at the edge.
  controls.addEventListener('change', () => {
    const t = controls.target;
    const c = clampPanTarget(t.x, t.z);
    const dx = c.x - t.x;
    const dz = c.z - t.z;
    if (dx === 0 && dz === 0) return;
    t.x += dx;
    t.z += dz;
    camera.position.x += dx;
    camera.position.z += dz;
  });
  controls.update();
  const rig = createCameraRig(camera, controls);

  let width = 1;
  let height = 1;
  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  let bloom: BloomSettings = { ...BLOOM };

  const invalidateShadows = () => { renderer.shadowMap.needsUpdate = true; };
  canvas.addEventListener('webglcontextrestored', invalidateShadows); // the restored map is empty

  const pixelRatio = (t: TierSettings) => Math.min(window.devicePixelRatio || 1, t.maxPixelRatio);

  const buildComposer = (): EffectComposer => {
    const pr = renderer.getPixelRatio();
    const c = new EffectComposer(renderer, new THREE.WebGLRenderTarget(width * pr, height * pr, { type: THREE.HalfFloatType }));
    // Only the scene render needs MSAA: renderTarget2 (where RenderPass draws, see renderComposed)
    // gets 4 samples; the full-screen passes write to the single-sample renderTarget1.
    c.renderTarget2.dispose();
    c.renderTarget2 = new THREE.WebGLRenderTarget(width * pr, height * pr, { type: THREE.HalfFloatType, samples: 4 });
    c.addPass(new RenderPass(scene, camera));
    const ao = new HalfResGTAOPass(scene, camera, width * pr, height * pr);
    ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1, thickness: 1, scale: 1 });
    // A tight, even denoise kernel; the default (radius 8, exponent 2) leaves speckles in narrow gaps.
    ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 16 });
    ao.blendIntensity = 0.85;
    c.addPass(ao);
    bloomPass = new HalfResBloomPass(new THREE.Vector2(width, height), bloom.strength, bloom.radius, bloom.threshold);
    c.addPass(bloomPass);
    c.addPass(new OutputPass());
    return c;
  };

  const disposeComposer = (c: EffectComposer) => {
    for (const pass of c.passes) pass.dispose();
    c.dispose();
    bloomPass = null;
  };

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    width = w;
    height = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false); // CSS owns the canvas's display size
    composer?.setSize(w, h);
    invalidateShadows();
  };

  const renderComposed = (c: EffectComposer) => {
    // Passes swap the buffers; start every frame from the same pair so the scene always lands in
    // the MSAA target, however many passes swap.
    c.readBuffer = c.renderTarget2;
    c.writeBuffer = c.renderTarget1;
    c.render();
  };

  const render = () => {
    if (composer) renderComposed(composer);
    else renderer.render(scene, camera);
  };

  const frameCallbacks: Array<(dtMs: number, nowMs: number) => void> = [];
  const stats = { calls: 0, triangles: 0 };

  const stage: Stage = {
    renderer, scene, camera, controls, canvas, rig,
    setQuality(next) {
      const t = TIERS[next];
      renderer.shadowMap.type = t.shadowType;
      renderer.setPixelRatio(pixelRatio(t));
      renderer.setSize(width, height, false);
      scene.traverse((o) => {
        if (o.castShadow && (o instanceof THREE.DirectionalLight || o instanceof THREE.SpotLight)) setShadowTier(o.shadow, next);
      });
      if (t.postProcessing && !composer) {
        composer = buildComposer();
      } else if (!t.postProcessing && composer) {
        disposeComposer(composer);
        composer = null;
      }
      if (composer) {
        composer.setPixelRatio(renderer.getPixelRatio());
        composer.setSize(width, height);
      }
      invalidateShadows(); // a new map size starts empty
    },
    onFrame(cb) {
      frameCallbacks.push(cb);
    },
    renderNow: render,
    invalidateShadows,
    frameStats: () => ({ ...stats }),
    setBloom(next) {
      bloom = { ...next };
      if (bloomPass) Object.assign(bloomPass, bloom); // the pass reads all three every frame
    },
  };

  new ResizeObserver(resize).observe(container);
  resize();
  stage.setQuality(q);
  watchReducedMotion(); // prefers-reduced-motion: reduce holds every item at rest, live

  let last = -1;
  renderer.setAnimationLoop((now) => {
    const dt = last < 0 ? 0 : Math.min(now - last, 100); // clamp: no rain jump after a hidden tab
    last = now;
    // Item animation runs in the kit shaders off one shared clock, advanced once here. It never
    // touches the shadow map: shadows are drawn from the rest pose, only when invalidated.
    advanceMotion(dt);
    for (const cb of frameCallbacks) cb(dt, now);
    rig.step(now);
    controls.update();
    renderer.info.reset();
    render();
    stats.calls = renderer.info.render.calls;
    stats.triangles = renderer.info.render.triangles;
  });

  return stage;
}
