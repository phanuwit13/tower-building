import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getStyleKit } from '../../models/kit';
import { school } from './index';

/**
 * A compact fingerprint of every school item's built geometry, so a refactor of the shared part
 * helpers can't silently change an approved look. Per mesh: triangle count, bounding box, and the
 * sums of positions and of colours. Rewrite on purpose with `UPDATE_GEOMETRY=1 npx vitest run`.
 */
const FILE = new URL('./geometry.snapshot.json', import.meta.url);
const TOLERANCE = 1e-3;

type Print = { tris: number; min: number[]; max: number[]; pos: number; color: number; glowColor: number };

function fingerprint(object: THREE.Object3D): Print[] {
  const prints: Print[] = [];
  object.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry;
    g.computeBoundingBox();
    const sum = (name: string) => (g.attributes[name] ? Array.from(g.attributes[name].array as Float32Array).reduce((a, b) => a + b, 0) : 0);
    prints.push({
      tris: g.attributes.position.count / 3,
      min: g.boundingBox!.min.toArray(), max: g.boundingBox!.max.toArray(),
      pos: sum('position'), color: sum('color'), glowColor: sum('glowColor'),
    });
  });
  return prints;
}

const current = () => Object.fromEntries(school.items.map((item) => [item.id, fingerprint(item.build(getStyleKit()))]));

describe('school item geometry fingerprints', () => {
  if (process.env.UPDATE_GEOMETRY) {
    it('rewrites the snapshot', () => writeFileSync(FILE, JSON.stringify(current(), null, 1) + '\n'));
    return;
  }
  const snapshot = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, Print[]>;
  const now = current();
  it('covers exactly the registered items', () => {
    expect(Object.keys(snapshot).sort()).toEqual(Object.keys(now).sort());
  });
  for (const id of Object.keys(snapshot)) {
    it(`${id} is built the same`, () => {
      expect(now[id]).toHaveLength(snapshot[id].length);
      now[id].forEach((p, i) => {
        const s = snapshot[id][i];
        expect(p.tris).toBe(s.tris);
        for (const k of ['pos', 'color', 'glowColor'] as const) expect(Math.abs(p[k] - s[k])).toBeLessThan(TOLERANCE);
        for (let c = 0; c < 3; c++) {
          expect(Math.abs(p.min[c] - s.min[c])).toBeLessThan(TOLERANCE);
          expect(Math.abs(p.max[c] - s.max[c])).toBeLessThan(TOLERANCE);
        }
      });
    });
  }
});
