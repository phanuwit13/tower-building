import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { GRID_SIZE } from '../game/types';
import type { ItemModel } from '../models/contract';
import { budgetLabel, countTriangles, galleryPages, selectItem, triangleBudget, type GallerySlot } from './gallery';

const fake = (id: string, w: number, d: number): ItemModel => ({
  id, name: id, category: 'decoration', footprint: { w, d }, build: () => new THREE.Group(),
});

/** A fixed list that fits one page, independent of how many items the School theme has. */
const small = [fake('big', 2, 3), fake('mid', 2, 2), fake('long', 1, 2), fake('s1', 1, 1), fake('s2', 1, 1)];

function overlaps(a: GallerySlot, b: GallerySlot): boolean {
  const fa = a.item.footprint, fb = b.item.footprint;
  return a.x < b.x + fb.w && b.x < a.x + fa.w && a.z < b.z + fb.d && b.z < a.z + fa.d;
}

function checkPage(page: GallerySlot[]): void {
  for (const s of page) {
    expect(s.x).toBeGreaterThanOrEqual(0);
    expect(s.z).toBeGreaterThanOrEqual(0);
    expect(s.x + s.item.footprint.w).toBeLessThanOrEqual(GRID_SIZE);
    expect(s.z + s.item.footprint.d).toBeLessThanOrEqual(GRID_SIZE);
    expect(Number.isInteger(s.x) && Number.isInteger(s.z)).toBe(true);
  }
  for (let i = 0; i < page.length; i++) for (let j = i + 1; j < page.length; j++) expect(overlaps(page[i], page[j])).toBe(false);
}

describe('galleryPages', () => {
  it('puts at most 5 items on a page so the fixed-size labels do not collide', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ ...small[3], id: `m${i}` }));
    const pages = galleryPages(many);
    expect(pages.reduce((n, p) => n + p.length, 0)).toBe(40);
    for (const p of pages) expect(p.length).toBeLessThanOrEqual(5);
  });
  it('fits a small list on one page, big footprints behind small ones', () => {
    const pages = galleryPages(small);
    expect(pages).toHaveLength(1);
    const [page] = pages;
    expect(page.map((s) => s.item.id).sort()).toEqual(small.map((i) => i.id).sort());
    checkPage(page);
    const z = (id: string) => page.find((s) => s.item.id === id)!.z;
    expect(z('big')).toBeLessThan(z('s1'));
    expect(z('mid')).toBeLessThan(z('long'));
  });
  it('keeps an empty tile between neighbours so labels have room', () => {
    const [page] = galleryPages(small);
    for (const a of page) {
      for (const b of page) {
        if (a === b) continue;
        const grown = { ...a, x: a.x - 1, z: a.z - 1, item: { ...a.item, footprint: { w: a.item.footprint.w + 2, d: a.item.footprint.d + 2 } } };
        expect(overlaps(grown, b)).toBe(false);
      }
    }
  });
  it('leaves two empty tiles between rows', () => {
    const [page] = galleryPages(small);
    const fronts = [...new Set(page.map((s) => s.z + s.item.footprint.d))].sort((a, b) => a - b); // rows share a front edge
    expect(fronts.length).toBeGreaterThan(1);
    for (let i = 1; i < fronts.length; i++) {
      const nextBack = Math.min(...page.filter((s) => s.z + s.item.footprint.d === fronts[i]).map((s) => s.z));
      expect(nextBack - fronts[i - 1]).toBeGreaterThanOrEqual(2);
    }
  });
  it('spreads a full theme over several pages, every item exactly once', () => {
    const items = [
      ...Array.from({ length: 4 }, (_, i) => fake(`h${i}`, 2, 3)),
      ...Array.from({ length: 8 }, (_, i) => fake(`q${i}`, 2, 2)),
      ...Array.from({ length: 12 }, (_, i) => fake(`l${i}`, 1, 2)),
      ...Array.from({ length: 16 }, (_, i) => fake(`s${i}`, 1, 1)),
    ];
    const pages = galleryPages(items);
    expect(pages.length).toBeGreaterThan(1);
    const ids = pages.flat().map((s) => s.item.id);
    expect(ids.sort()).toEqual(items.map((i) => i.id).sort());
    for (const p of pages) checkPage(p);
  });
  it('has no pages for no items', () => {
    expect(galleryPages([])).toEqual([]);
  });
});

describe('budget labels', () => {
  it('uses the validator formula 800 + 400 * w * d', () => {
    expect(triangleBudget({ w: 1, d: 1 })).toBe(1200);
    expect(triangleBudget({ w: 2, d: 3 })).toBe(3200);
  });
  it('formats used / budget with thousands separators', () => {
    expect(budgetLabel(612, { w: 2, d: 2 })).toBe('612 / 2,400');
    expect(budgetLabel(1234, { w: 3, d: 2 })).toBe('1,234 / 3,200');
  });
  it('counts indexed and non-indexed triangles across meshes', () => {
    const indexed = new THREE.BufferGeometry();
    indexed.setAttribute('position', new THREE.Float32BufferAttribute(new Array(12).fill(0), 3));
    indexed.setIndex([0, 1, 2, 0, 2, 3]);
    const plain = new THREE.BufferGeometry();
    plain.setAttribute('position', new THREE.Float32BufferAttribute(new Array(27).fill(0), 3));
    const g = new THREE.Group();
    g.add(new THREE.Mesh(indexed), new THREE.Mesh(plain));
    expect(countTriangles(g)).toBe(2 + 3);
  });
});

describe('selectItem', () => {
  it('finds an item by id, and is undefined for unknown or missing ids', () => {
    expect(selectItem(small, 'mid')?.id).toBe('mid');
    expect(selectItem(small, 'nope')).toBeUndefined();
    expect(selectItem(small, null)).toBeUndefined();
  });
});
