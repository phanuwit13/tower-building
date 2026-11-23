import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type * as THREE from 'three';
import { getStyleKit } from '../models/kit';
import type { ThemeDef } from './types';

/**
 * A compact fingerprint of every item's built geometry, per theme, so a refactor of the shared part
 * helpers can't silently change an approved look. Per mesh: triangle count, bounding box, and the
 * sums of positions and of colours. Each theme has `src/themes/<theme>/geometry.test.ts` (one
 * call to describeGeometrySnapshot) and its `geometry.snapshot.json`.
 */
export type Print = { tris: number; min: number[]; max: number[]; pos: number; color: number; glowColor: number };

export const TOLERANCE = 1e-3;

export function fingerprint(object: THREE.Object3D): Print[] {
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

/** How `got` differs from `want` (one item's prints): empty when they match within `tolerance`. */
export function printDiffs(want: readonly Print[], got: readonly Print[], tolerance = TOLERANCE): string[] {
  if (want.length !== got.length) return [`${want.length} mesh(es) -> ${got.length}`];
  const diffs: string[] = [];
  want.forEach((s, i) => {
    const p = got[i];
    if (p.tris !== s.tris) diffs.push(`mesh ${i}: tris ${s.tris} -> ${p.tris}`);
    for (const k of ['pos', 'color', 'glowColor'] as const) {
      if (!(Math.abs(p[k] - s[k]) < tolerance)) diffs.push(`mesh ${i}: ${k} ${s[k]} -> ${p[k]}`);
    }
    for (const k of ['min', 'max'] as const) {
      if (!s[k].every((v, c) => Math.abs(p[k][c] - v) < tolerance)) diffs.push(`mesh ${i}: ${k} ${s[k].join(', ')} -> ${p[k].join(', ')}`);
    }
  });
  return diffs;
}

/**
 * The fingerprint suite of one theme's items against `file` (its geometry.snapshot.json). Rewrite
 * on purpose with `UPDATE_GEOMETRY=1 npx vitest run src/themes/<theme>/geometry.test.ts`, then
 * review the JSON diff: only the items meant to change may appear in it.
 */
export function describeGeometrySnapshot(theme: ThemeDef, file: URL): void {
  const current = () => Object.fromEntries(theme.items.map((item) => [item.id, fingerprint(item.build(getStyleKit()))]));
  describe(`${theme.id} item geometry fingerprints`, () => {
    if (process.env.UPDATE_GEOMETRY) {
      it('rewrites the snapshot', () => writeFileSync(file, JSON.stringify(current(), null, 1) + '\n'));
      return;
    }
    if (!existsSync(file)) {
      it('has a snapshot', () => {
        const test = relative(process.cwd(), fileURLToPath(file)).replace(/geometry\.snapshot\.json$/, 'geometry.test.ts');
        throw new Error(`no geometry snapshot yet: UPDATE_GEOMETRY=1 npx vitest run ${test}`);
      });
      return;
    }
    const snapshot = JSON.parse(readFileSync(file, 'utf8')) as Record<string, Print[]>;
    const now = current();
    it('covers exactly the registered items', () => {
      expect(Object.keys(snapshot).sort()).toEqual(Object.keys(now).sort());
    });
    for (const id of Object.keys(snapshot)) {
      it(`${id} is built the same`, () => {
        expect(now[id], `${id} is not in the theme`).toBeDefined();
        expect(printDiffs(snapshot[id], now[id])).toEqual([]);
      });
    }
  });
}
