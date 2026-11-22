import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from './kit';
import { PALETTE } from './palette';

const kit = getStyleKit();

function box(g: THREE.BufferGeometry): THREE.Box3 {
  g.computeBoundingBox();
  return g.boundingBox!;
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
