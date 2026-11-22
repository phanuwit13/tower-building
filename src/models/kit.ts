import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, type PaletteColor } from './palette';

export interface Part { geometry: THREE.BufferGeometry; glow: boolean }
type Vec3 = [number, number, number];
interface PartOpts { rotate?: Vec3; glow?: boolean }

export interface StyleKit {
  materials: { body: THREE.MeshStandardMaterial; glow: THREE.MeshStandardMaterial };
  setGlowStrength(v: number): void;
  getGlowStrength(): number;
  box(size: Vec3, at: Vec3, color: PaletteColor, opts?: PartOpts & { round?: number }): Part;
  cylinder(rTop: number, rBottom: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  cone(r: number, h: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { segments?: number }): Part;
  sphere(r: number, at: Vec3, color: PaletteColor, opts?: PartOpts & { detail?: number }): Part;
  finish(parts: Part[]): THREE.Group;
}

/** Non-indexed geometry with exactly position, normal, color; transformed and coloured. */
function prepare(src: THREE.BufferGeometry, at: Vec3, color: PaletteColor, opts?: PartOpts): Part {
  let g = src.index ? src.toNonIndexed() : src;
  if (g !== src) src.dispose();
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
  }
  if (opts?.rotate) {
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...opts.rotate)));
  }
  g.translate(at[0], at[1], at[2]);
  const c = new THREE.Color(PALETTE[color]);
  const n = g.attributes.position.count;
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return { geometry: g, glow: opts?.glow ?? false };
}

function createKit(): StyleKit {
  const glowUniform = { value: 0 };
  const body = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
  const glow = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
  glow.onBeforeCompile = (s) => {
    s.uniforms.glowStrength = glowUniform;
    s.fragmentShader = 'uniform float glowStrength;\n' + s.fragmentShader.replace(
      'vec3 totalEmissiveRadiance = emissive;',
      'vec3 totalEmissiveRadiance = vColor.rgb * glowStrength * 1.5;');
  };

  const merge = (parts: Part[], material: THREE.Material): THREE.Mesh | null => {
    if (parts.length === 0) return null;
    const merged = mergeGeometries(parts.map((p) => p.geometry), false);
    for (const p of parts) p.geometry.dispose();
    if (!merged) throw new Error('style kit: mergeGeometries failed');
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  return {
    materials: { body, glow },
    setGlowStrength(v) { glowUniform.value = v; },
    getGlowStrength: () => glowUniform.value,
    box(size, at, color, opts) {
      const r = opts?.round ?? 0;
      const geo = r > 0
        ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(r, Math.min(...size) / 2))
        : new THREE.BoxGeometry(size[0], size[1], size[2]);
      return prepare(geo, at, color, opts);
    },
    cylinder(rTop, rBottom, h, at, color, opts) {
      return prepare(new THREE.CylinderGeometry(rTop, rBottom, h, opts?.segments ?? 12), at, color, opts);
    },
    cone(r, h, at, color, opts) {
      return prepare(new THREE.ConeGeometry(r, h, opts?.segments ?? 12), at, color, opts);
    },
    sphere(r, at, color, opts) {
      return prepare(new THREE.IcosahedronGeometry(r, opts?.detail ?? 1), at, color, opts);
    },
    finish(parts) {
      const group = new THREE.Group();
      const bodyMesh = merge(parts.filter((p) => !p.glow), body);
      const glowMesh = merge(parts.filter((p) => p.glow), glow);
      if (bodyMesh) group.add(bodyMesh);
      if (glowMesh) group.add(glowMesh);
      return group;
    },
  };
}

let instance: StyleKit | undefined;
export function getStyleKit(): StyleKit {
  return (instance ??= createKit());
}
