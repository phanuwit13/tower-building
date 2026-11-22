import * as THREE from 'three';
import type { ItemModel } from '../models/contract';
import type { StyleKit } from '../models/kit';

const SIZE = 128;
const VIEW_DIR = new THREE.Vector3(1, 0.85, 1).normalize(); // fixed 3/4 angle
const FOV = 35;

/** What the thumbnailer needs from WebGL; injectable so the failure paths can be tested. */
export interface ThumbGl {
  renderer: { render(scene: THREE.Scene, camera: THREE.Camera): void; domElement: { toDataURL(type: string): string } };
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

function createGl(): ThumbGl {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xdfeeff, 0x8a8f6a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2dd, 1.6);
  sun.position.set(-4, 8, 5);
  scene.add(sun);
  return { renderer, scene, camera: new THREE.PerspectiveCamera(FOV, 1, 0.1, 100) };
}

/**
 * Small offscreen renderer that turns item models into transparent PNG data URLs.
 * Cached per ItemModel object (ids may repeat across themes). A WebGL init failure disables
 * thumbnails for good; a single item that fails gets '' and is not retried, the others still work.
 */
export function createThumbnailer(kit: StyleKit, makeGl: () => ThumbGl = createGl): { get(item: ItemModel): string } {
  const cache = new WeakMap<ItemModel, string>();
  let gl: ThumbGl | null = null;
  let disabled = false;

  return {
    get(item) {
      const hit = cache.get(item);
      if (hit !== undefined) return hit;
      if (disabled) return '';
      if (!gl) {
        try {
          gl = makeGl();
        } catch {
          disabled = true; // WebGL unavailable: the HUD tolerates empty thumbs
          return '';
        }
      }
      const { renderer, scene, camera } = gl;
      // Thumbnails must not bake the current night-time window glow into the picture.
      const glow = kit.getGlowStrength();
      kit.setGlowStrength(0);
      let model: THREE.Object3D | null = null;
      let url = '';
      try {
        model = item.build(kit);
        scene.add(model);
        const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
        const dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(FOV / 2))) * 1.05;
        camera.position.copy(sphere.center).addScaledVector(VIEW_DIR, dist);
        camera.near = Math.max(0.1, dist - sphere.radius * 2);
        camera.far = dist + sphere.radius * 2;
        camera.lookAt(sphere.center);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        url = renderer.domElement.toDataURL('image/png');
      } catch {
        url = ''; // this item only: it is cached as '' and never retried
      } finally {
        kit.setGlowStrength(glow);
        if (model) {
          scene.remove(model);
          model.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); // shared kit materials stay
        }
      }
      cache.set(item, url);
      return url;
    },
  };
}
