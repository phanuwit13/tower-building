import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GRID_SIZE, type QualityTier } from '../game/types';

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  canvas: HTMLCanvasElement;
  setQuality(q: QualityTier): void;
  onFrame(cb: (dtMs: number, nowMs: number) => void): void;
  renderNow(): void;
}

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
  pretty: { maxPixelRatio: 2, shadowType: THREE.PCFShadowMap, shadowSize: 2048, shadowRadius: 3, postProcessing: true },
  smooth: { maxPixelRatio: 1, shadowType: THREE.PCFShadowMap, shadowSize: 1024, shadowRadius: 1, postProcessing: false },
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
 * Lights are authored dimmer and the exposure raised to match, so lit daytime surfaces stay under
 * the bloom threshold (0.85, measured before exposure) and only glowing parts bloom.
 */
const EXPOSURE = 1.4;

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
  const canvas = renderer.domElement;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(16, 13, 16);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(MAP_CENTER);
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 26;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = 1.25;
  controls.enableDamping = true;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  controls.update();

  let width = 1;
  let height = 1;
  let composer: EffectComposer | null = null;

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
    c.addPass(new HalfResBloomPass(new THREE.Vector2(width, height), 0.5, 0.4, 0.85));
    c.addPass(new OutputPass());
    return c;
  };

  const disposeComposer = (c: EffectComposer) => {
    for (const pass of c.passes) pass.dispose();
    c.dispose();
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

  const stage: Stage = {
    renderer, scene, camera, controls, canvas,
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
    },
    onFrame(cb) {
      frameCallbacks.push(cb);
    },
    renderNow: render,
  };

  new ResizeObserver(resize).observe(container);
  resize();
  stage.setQuality(q);

  let last = -1;
  renderer.setAnimationLoop((now) => {
    const dt = last < 0 ? 0 : Math.min(now - last, 100); // clamp: no rain jump after a hidden tab
    last = now;
    for (const cb of frameCallbacks) cb(dt, now);
    controls.update();
    render();
  });

  return stage;
}
