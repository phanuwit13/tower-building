import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from '../models/kit';
import { THEMES } from '../themes/registry';

const kit = getStyleKit();
/** Floor tiles rise up to 0.015: no item may have a real upward-facing surface lower than this margin (see sculpting.md section 8). */
const MIN_SURFACE_Y = 0.02;
const GROUND_EPS = 0.001; // faces on the ground itself are the item's underside, not a surface
const MAX_AREA = 0.01;
const FLOAT_EPS = 1e-4; // a face authored at exactly 0.02 comes out of float32 as 0.01999

/** Area of upward-facing triangles lying flat with every vertex strictly between the ground and MIN_SURFACE_Y. */
export function lowSurfaceArea(obj: THREE.Object3D): number {
  obj.updateMatrixWorld(true);
  let area = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  obj.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const m = o as THREE.Mesh;
    const pos = m.geometry.attributes.position;
    const idx = m.geometry.index;
    const count = idx ? idx.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const at = (k: number, v: THREE.Vector3) => v.fromBufferAttribute(pos, idx ? idx.getX(i + k) : i + k).applyMatrix4(m.matrixWorld);
      at(0, a); at(1, b); at(2, c);
      const ys = [a.y, b.y, c.y];
      if (ys.some((y) => y <= GROUND_EPS || y >= MIN_SURFACE_Y - FLOAT_EPS)) continue;
      n.subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b));
      if (n.y <= 0) continue; // faces down or sideways
      if (n.y / n.length() < 0.5) continue;
      area += n.length() / 2;
    }
  });
  return area;
}

describe('item ground surfaces vs floor tiles', () => {
  it('measures a low upward face (self-check)', () => {
    const low = new THREE.Mesh(new THREE.BoxGeometry(1, 0.01, 1).translate(0, 0.0105, 0));
    expect(lowSurfaceArea(low)).toBeCloseTo(1, 3);
    const ok = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 1).translate(0, 0.01, 0));
    expect(lowSurfaceArea(ok)).toBe(0);
  });
  for (const theme of THEMES) {
    for (const item of theme.items) {
      it(`${theme.id}/${item.id} has no ground surface under 0.02`, () => {
        expect(lowSurfaceArea(item.build(kit))).toBeLessThan(MAX_AREA);
      });
    }
  }
});
