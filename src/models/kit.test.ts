import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from './kit';
import { PALETTE } from './palette';

const kit = getStyleKit();

function box(g: THREE.BufferGeometry): THREE.Box3 {
  g.computeBoundingBox();
  return g.boundingBox!;
}

const size = (g: THREE.BufferGeometry) => box(g).getSize(new THREE.Vector3());
const centre = (g: THREE.BufferGeometry) => box(g).getCenter(new THREE.Vector3());
const tris = (g: THREE.BufferGeometry) => g.attributes.position.count / 3;
const attrs = (g: THREE.BufferGeometry) => Object.keys(g.attributes).sort();

/**
 * Faces whose winding (counter-clockwise seen from outside) or stored normal does not point away
 * from the part's inside. `inside(c)` gives an inside point to measure a face centre `c` against.
 */
function inwardFaces(g: THREE.BufferGeometry, inside: (c: THREE.Vector3) => THREE.Vector3): number {
  const pos = g.attributes.position;
  const nrm = g.attributes.normal;
  let bad = 0;
  for (let t = 0; t < pos.count; t += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, t + k));
    const mid = a.clone().add(b).add(c).divideScalar(3);
    const out = mid.clone().sub(inside(mid));
    const wound = b.clone().sub(a).cross(c.clone().sub(a));
    const stored = new THREE.Vector3();
    for (let k = 0; k < 3; k++) stored.add(new THREE.Vector3().fromBufferAttribute(nrm, t + k));
    if (wound.dot(out) <= 0 || stored.dot(out) <= 0) bad++;
  }
  return bad;
}

describe('style kit wedge', () => {
  it('is a closed 8-triangle prism filling its size, centred on `at`', () => {
    const p = kit.wedge([2, 1, 3], [1, 0.5, -2], 'red');
    expect(p.geometry.attributes.position.count / 3).toBe(8);
    const b = box(p.geometry);
    expect(b.min.toArray()).toEqual([0, 0, -3.5]);
    expect(b.max.toArray()).toEqual([2, 1, -0.5]);
    expect(p.glow).toBe(false);
  });
  it('puts the ridge over the centre by default and over an edge with apex', () => {
    const top = (g: THREE.BufferGeometry) => {
      const pos = g.attributes.position;
      const xs = new Set<number>();
      for (let i = 0; i < pos.count; i++) if (Math.abs(pos.getY(i) - 0.5) < 1e-6) xs.add(Math.round(pos.getX(i) * 1000) / 1000);
      return [...xs];
    };
    expect(top(kit.wedge([2, 1, 1], [0, 0, 0], 'red').geometry)).toEqual([0]);
    expect(top(kit.wedge([2, 1, 1], [0, 0, 0], 'red', { apex: -0.5 }).geometry)).toEqual([-1]);
  });
  it('faces point outwards (normals away from the centre)', () => {
    const g = kit.wedge([2, 1, 3], [0, 0, 0], 'red', { apex: 0.25 }).geometry;
    const pos = g.attributes.position;
    const nrm = g.attributes.normal;
    for (let t = 0; t < pos.count; t += 3) {
      const c = new THREE.Vector3();
      for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(pos, t + k));
      c.divideScalar(3);
      const n = new THREE.Vector3().fromBufferAttribute(nrm, t);
      // the prism's centroid sits at (apex-ish, -1/6 h, 0): every face centre lies on the outward side
      expect(n.dot(c.sub(new THREE.Vector3(0.1, -1 / 6, 0)))).toBeGreaterThan(0);
    }
  });
  it('is coloured and rotated like the other parts, and can glow', () => {
    const p = kit.wedge([1, 1, 1], [0, 0, 0], 'sunYellow', { rotate: [0, Math.PI / 2, 0], glow: true });
    expect(p.glow).toBe(true);
    const want = new THREE.Color(PALETTE.sunYellow);
    const col = p.geometry.attributes.color;
    expect(col.getX(0)).toBeCloseTo(want.r);
    expect(col.getZ(5)).toBeCloseTo(want.b);
    expect(Object.keys(p.geometry.attributes).sort()).toEqual(['color', 'glowColor', 'normal', 'position']);
    const g = kit.finish([p, kit.box([1, 1, 1], [0, 0, 0], 'red')]);
    expect(g.children).toHaveLength(2);
  });
});

describe('style kit glow colour', () => {
  const first = (g: THREE.BufferGeometry, name: string) => new THREE.Color().fromBufferAttribute(g.attributes[name] as THREE.BufferAttribute, 0);
  it('glow: palette colour keeps the surface colour and emits the given colour', () => {
    const p = kit.box([1, 1, 1], [0, 0, 0], 'glassBlue', { glow: 'windowWarm' });
    expect(p.glow).toBe(true);
    expect(first(p.geometry, 'color').getHex()).toBe(new THREE.Color(PALETTE.glassBlue).getHex());
    expect(first(p.geometry, 'glowColor').getHex()).toBe(new THREE.Color(PALETTE.windowWarm).getHex());
    expect(p.geometry.attributes.glowColor.count).toBe(p.geometry.attributes.color.count);
  });
  it('glow: true emits its own colour', () => {
    const p = kit.box([1, 1, 1], [0, 0, 0], 'lampWarm', { glow: true });
    expect(first(p.geometry, 'glowColor').getHex()).toBe(first(p.geometry, 'color').getHex());
  });
  it('body parts get no glowColor and finish merges body + both glow kinds', () => {
    const body = kit.box([1, 1, 1], [0, 0, 0], 'red');
    expect(body.glow).toBe(false);
    expect(Object.keys(body.geometry.attributes).sort()).toEqual(['color', 'normal', 'position']);
    const g = kit.finish([
      body,
      kit.box([1, 1, 1], [0, 0, 0], 'glassBlue', { glow: 'windowWarm' }),
      kit.sphere(0.2, [0, 0, 0], 'lampWarm', { glow: true }),
    ]);
    expect(g.children).toHaveLength(2);
    const glowMesh = g.children[1] as THREE.Mesh;
    expect(Object.keys(glowMesh.geometry.attributes).sort()).toEqual(['color', 'glowColor', 'normal', 'position']);
  });
  it('the glow shader emits glowColor, not vColor', () => {
    const shader = { uniforms: {}, vertexShader: 'void main() {\n}', fragmentShader: 'vec3 totalEmissiveRadiance = emissive;' };
    kit.materials.glow.onBeforeCompile(shader as never, null as never);
    expect(shader.fragmentShader).toContain('vGlowColor * glowStrength');
    expect(shader.vertexShader).toContain('vGlowColor = glowColor');
  });
});

describe('style kit scale', () => {
  it('scales a part first, then rotates it, then moves it to `at`', () => {
    // a unit box stretched along x and flattened along z, then turned a quarter about y
    const g = kit.box([1, 1, 1], [1, 2, 3], 'red', { scale: [2, 1, 0.5], rotate: [0, Math.PI / 2, 0] }).geometry;
    expect(size(g).x).toBeCloseTo(0.5);
    expect(size(g).y).toBeCloseTo(1);
    expect(size(g).z).toBeCloseTo(2);
    expect(centre(g).toArray().map((v) => +v.toFixed(6))).toEqual([1, 2, 3]);
  });
  it('turns a sphere into an ellipsoid around the same centre', () => {
    const plain = kit.sphere(0.5, [0, 1, 0], 'leaf').geometry;
    const squashed = kit.sphere(0.5, [0, 1, 0], 'leaf', { scale: [1, 0.5, 2] }).geometry;
    expect(size(squashed).x).toBeCloseTo(size(plain).x);
    expect(size(squashed).y).toBeCloseTo(size(plain).y * 0.5);
    expect(size(squashed).z).toBeCloseTo(size(plain).z * 2);
    expect(centre(squashed).distanceTo(centre(plain))).toBeCloseTo(0);
    expect(inwardFaces(squashed, () => new THREE.Vector3(0, 1, 0))).toBe(0);
  });
  it('works on every primitive', () => {
    const s: [number, number, number] = [2, 0.5, 1.5];
    const makers = [
      (o?: { scale: [number, number, number] }) => kit.cylinder(0.2, 0.3, 1, [0, 0.5, 0], 'blue', o),
      (o?: { scale: [number, number, number] }) => kit.cone(0.3, 1, [0, 0.5, 0], 'blue', o),
      (o?: { scale: [number, number, number] }) => kit.wedge([1, 1, 1], [0, 0.5, 0], 'blue', o),
      (o?: { scale: [number, number, number] }) => kit.torus(0.4, 0.1, [0, 0.5, 0], 'blue', o),
      (o?: { scale: [number, number, number] }) => kit.dome(0.4, [0, 0, 0], 'blue', o),
    ];
    for (const make of makers) {
      const a = size(make().geometry);
      const b = size(make({ scale: s }).geometry);
      expect([b.x / a.x, b.y / a.y, b.z / a.z].map((v) => +v.toFixed(6))).toEqual(s);
    }
  });
  it('keeps faces pointing outwards when a negative scale mirrors the part', () => {
    const g = kit.wedge([2, 1, 3], [0, 0, 0], 'red', { apex: 0.25, scale: [-1, 1, 1] }).geometry;
    expect(box(g).max.x).toBeCloseTo(1);
    // mirrored: the ridge is now at x = -0.5, so the prism's centroid is at about (-0.17, -1/6, 0)
    expect(inwardFaces(g, () => new THREE.Vector3(-0.1, -1 / 6, 0))).toBe(0);
  });
  it('rejects a zero scale', () => {
    expect(() => kit.box([1, 1, 1], [0, 0, 0], 'red', { scale: [1, 0, 1] })).toThrow(/scale/);
  });
});

describe('style kit torus', () => {
  it('is a low-poly ring in the x-y plane around `at`, with exactly position, normal and color', () => {
    const p = kit.torus(0.5, 0.1, [1, 2, 3], 'orange');
    const g = p.geometry;
    expect(attrs(g)).toEqual(['color', 'normal', 'position']);
    expect(p.glow).toBe(false);
    expect(tris(g)).toBe(6 * 12 * 2);
    const b = box(g);
    expect(b.min.x).toBeCloseTo(0.4);
    expect(b.max.x).toBeCloseTo(1.6);
    expect(b.min.y).toBeCloseTo(1.4);
    expect(b.max.y).toBeCloseTo(2.6);
    expect(b.min.z).toBeGreaterThanOrEqual(2.9 - 1e-6);
    expect(b.max.z).toBeLessThanOrEqual(3.1 + 1e-6);
    const want = new THREE.Color(PALETTE.orange);
    expect(g.attributes.color.getX(7)).toBeCloseTo(want.r);
  });
  it('faces point outwards from the tube', () => {
    const g = kit.torus(0.5, 0.12, [0, 0, 0], 'orange', { radialSegments: 5, tubularSegments: 9 }).geometry;
    const onRing = (c: THREE.Vector3) => new THREE.Vector3(c.x, c.y, 0).setLength(0.5);
    expect(inwardFaces(g, onRing)).toBe(0);
  });
  it('arc makes an arch whose open ends stand flat on y = at[1], with segments in proportion', () => {
    const g = kit.torus(0.5, 0.05, [0, 1, 0], 'red', { arc: Math.PI }).geometry;
    const b = box(g);
    expect(b.min.y).toBeCloseTo(1, 6);
    expect(b.max.y).toBeCloseTo(1.55);
    expect(b.min.x).toBeCloseTo(-0.55);
    expect(b.max.x).toBeCloseTo(0.55);
    expect(tris(g)).toBe(6 * 6 * 2);
  });
  it('can glow', () => {
    const p = kit.torus(0.3, 0.05, [0, 0, 0], 'skyBlue', { glow: 'windowWarm' });
    expect(p.glow).toBe(true);
    expect(attrs(p.geometry)).toEqual(['color', 'glowColor', 'normal', 'position']);
    expect(new THREE.Color().fromBufferAttribute(p.geometry.attributes.glowColor as THREE.BufferAttribute, 0).getHex())
      .toBe(new THREE.Color(PALETTE.windowWarm).getHex());
  });
});

describe('style kit dome', () => {
  it('is a closed low-poly hemisphere standing on y = at[1], with exactly position, normal and color', () => {
    const p = kit.dome(0.5, [1, 2, 3], 'white');
    const g = p.geometry;
    expect(attrs(g)).toEqual(['color', 'normal', 'position']);
    expect(p.glow).toBe(false);
    const b = box(g);
    expect(b.min.toArray().map((v) => +v.toFixed(6))).toEqual([0.5, 2, 2.5]);
    expect(b.max.toArray().map((v) => +v.toFixed(6))).toEqual([1.5, 2.5, 3.5]);
  });
  it('has a flat base at y = at[1] that faces down', () => {
    const g = kit.dome(0.5, [0, 2, 0], 'white', { segments: 10 }).geometry;
    const pos = g.attributes.position;
    let base = 0;
    for (let t = 0; t < pos.count; t += 3) {
      const ys = [0, 1, 2].map((k) => pos.getY(t + k));
      if (ys.every((y) => Math.abs(y - 2) < 1e-6)) {
        base++;
        const [a, b, c] = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, t + k));
        expect(b.sub(a).cross(c.sub(a)).normalize().y).toBeCloseTo(-1);
        expect(g.attributes.normal.getY(t)).toBeCloseTo(-1);
      }
    }
    expect(base).toBe(10);
  });
  it('faces point outwards', () => {
    const g = kit.dome(0.5, [0, 0, 0], 'white', { segments: 9 }).geometry;
    expect(inwardFaces(g, () => new THREE.Vector3(0, 0.5 * (3 / 8), 0))).toBe(0);
  });
  it('a scale keeps its base on y = at[1]', () => {
    const b = box(kit.dome(0.5, [0, 1, 0], 'white', { scale: [1, 2, 1] }).geometry);
    expect(b.min.y).toBeCloseTo(1, 6);
    expect(b.max.y).toBeCloseTo(2);
  });
  it('can glow with its own colour', () => {
    const p = kit.dome(0.3, [0, 0, 0], 'lampWarm', { glow: true });
    expect(p.glow).toBe(true);
    expect(attrs(p.geometry)).toEqual(['color', 'glowColor', 'normal', 'position']);
    const g = kit.finish([p, kit.torus(0.3, 0.05, [0, 0.3, 0], 'navy')]);
    expect(g.children).toHaveLength(2);
  });
});
