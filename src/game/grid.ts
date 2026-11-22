import { GRID_SIZE, type Catalog, type FillStats, type Footprint, type Placement, type Rotation } from './types';

export function rotatedFootprint(fp: Footprint, r: Rotation): Footprint {
  return r % 2 === 1 ? { w: fp.d, d: fp.w } : { w: fp.w, d: fp.d };
}

/** Occupancy index is z * GRID_SIZE + x. Throws if a placement's item is not in the catalog. */
export function buildOccupancy(placements: readonly Placement[], catalog: Catalog): Uint8Array {
  const occ = new Uint8Array(GRID_SIZE * GRID_SIZE);
  for (const pl of placements) {
    const spec = catalog.items[pl.itemId];
    if (!spec) throw new Error(`Unknown item id in catalog "${catalog.themeId}": ${pl.itemId}`);
    const { w, d } = rotatedFootprint(spec.footprint, pl.rotation);
    for (let z = pl.z; z < pl.z + d; z++) {
      for (let x = pl.x; x < pl.x + w; x++) {
        if (x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE) occ[z * GRID_SIZE + x] = 1;
      }
    }
  }
  return occ;
}

export function canPlace(occ: Uint8Array, fp: Footprint, r: Rotation, x: number, z: number): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(z)) return false;
  const { w, d } = rotatedFootprint(fp, r);
  if (x < 0 || z < 0 || x + w > GRID_SIZE || z + d > GRID_SIZE) return false;
  for (let zz = z; zz < z + d; zz++) {
    for (let xx = x; xx < x + w; xx++) {
      if (occ[zz * GRID_SIZE + xx]) return false;
    }
  }
  return true;
}

export function fitsAnywhere(occ: Uint8Array, fp: Footprint): boolean {
  for (const r of [0, 1] as const) {
    for (let z = 0; z < GRID_SIZE; z++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (canPlace(occ, fp, r, x, z)) return true;
      }
    }
  }
  return false;
}

export function clampPosition(fp: Footprint, r: Rotation, x: number, z: number): { x: number; z: number } {
  const { w, d } = rotatedFootprint(fp, r);
  return {
    x: Math.min(Math.max(x, 0), GRID_SIZE - w),
    z: Math.min(Math.max(z, 0), GRID_SIZE - d),
  };
}

/** Valid spot whose rotated-footprint centre is closest to (cx, cz); ties → smaller z, then smaller x. */
export function nearestFreeSpot(
  occ: Uint8Array, fp: Footprint, r: Rotation, cx: number, cz: number,
): { x: number; z: number } | null {
  const { w, d } = rotatedFootprint(fp, r);
  let best: { x: number; z: number } | null = null;
  let bestDist = Infinity;
  // z-major, x ascending: strict '<' keeps the first (smaller z, then smaller x) on ties.
  for (let z = 0; z <= GRID_SIZE - d; z++) {
    for (let x = 0; x <= GRID_SIZE - w; x++) {
      if (!canPlace(occ, fp, r, x, z)) continue;
      const dx = x + w / 2 - cx;
      const dz = z + d / 2 - cz;
      const dist = dx * dx + dz * dz;
      if (dist < bestDist) {
        bestDist = dist;
        best = { x, z };
      }
    }
  }
  return best;
}

export function fillStats(placements: readonly Placement[], catalog: Catalog): FillStats {
  let tilesUsed = 0;
  for (const pl of placements) {
    const spec = catalog.items[pl.itemId];
    if (!spec) throw new Error(`Unknown item id in catalog "${catalog.themeId}": ${pl.itemId}`);
    tilesUsed += spec.footprint.w * spec.footprint.d;
  }
  return {
    items: placements.length,
    tilesUsed,
    percent: Math.round((tilesUsed / (GRID_SIZE * GRID_SIZE)) * 100),
  };
}
