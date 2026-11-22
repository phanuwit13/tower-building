import * as THREE from 'three';
import type { ItemModel } from '../models/contract';
import type { StyleKit } from '../models/kit';

const SIZE = 128;
const VIEW_DIR = new THREE.Vector3(1, 0.85, 1).normalize(); // fixed 3/4 angle
const FOV = 35;

/** Small offscreen renderer that turns item models into transparent PNG data URLs, cached by item id. */
export function createThumbnailer(kit: StyleKit): { get(item: ItemModel): string } {
  const cache = new Map<string, string>();
  let gl: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera } | null = null;
  let failed = false;

  const init = () => {
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
    gl = { renderer, scene, camera: new THREE.PerspectiveCamera(FOV, 1, 0.1, 100) };
  };

  return {
    get(item) {
      const hit = cache.get(item.id);
      if (hit !== undefined) return hit;
      if (failed) return '';
      try {
        if (!gl) init();
        const { renderer, scene, camera } = gl!;
        const model = item.build(kit);
        scene.add(model);
        const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
        const dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(FOV / 2))) * 1.05;
        camera.position.copy(sphere.center).addScaledVector(VIEW_DIR, dist);
        camera.near = Math.max(0.1, dist - sphere.radius * 2);
        camera.far = dist + sphere.radius * 2;
        camera.lookAt(sphere.center);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        const url = renderer.domElement.toDataURL('image/png');
        scene.remove(model);
        model.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); }); // shared kit materials stay
        cache.set(item.id, url);
        return url;
      } catch {
        failed = true; // WebGL unavailable: the HUD tolerates empty thumbs
        return '';
      }
    },
  };
}
