import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { GRID_SIZE } from '../game/types';
import type { ItemModel } from '../models/contract';
import { galleryPages, type GallerySlot } from './gallery';

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
