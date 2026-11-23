import { describe, expect, it } from 'vitest';
import { FLOOR_TILES } from '../floors';
import type { FloorTile } from '../floors/types';
import { floorGalleryPages } from './floorGallery';

const fake = (n: number): FloorTile[] => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, name: `t${i}`, group: 'tile', build: () => { throw new Error('unused'); } }));

describe('floorGalleryPages', () => {
  it('puts every tile on exactly one page, 6 to a page', () => {
    const pages = floorGalleryPages(fake(13));
    expect(pages.map((p) => p.length)).toEqual([6, 6, 1]);
    expect(pages.flat().map((s) => s.tile.id)).toEqual(fake(13).map((t) => t.id));
  });
  it('keeps patches apart and on the map', () => {
    for (const page of floorGalleryPages(fake(6))) {
      for (const a of page) {
        expect(a.x).toBeGreaterThanOrEqual(0);
        expect(a.x + 3).toBeLessThanOrEqual(20);
        expect(a.z + 3).toBeLessThanOrEqual(20);
        for (const b of page) if (a !== b) expect(a.x < b.x + 3 && b.x < a.x + 3 && a.z < b.z + 3 && b.z < a.z + 3).toBe(false);
      }
    }
  });
  it('lists the real tiles', () => {
    expect(floorGalleryPages(FLOOR_TILES).flat()).toHaveLength(FLOOR_TILES.length);
    expect(floorGalleryPages([])).toEqual([]);
  });
});
