import { draw } from './bag';
import { canPlace, rotatedFootprint } from './grid';
import { nextRandom } from './rng';
import { emptyFloors } from './floors';
import { GRID_SIZE, type Catalog, type GameState, type Placement, type Rotation, type SceneSettings } from './types';

/**
 * Dev aid for `?demo=full`: a round played to the end, for measuring a full map. Items come
 * from the shuffle bag (so the first 50 are every type once) and go where they touch the most
 * border or neighbours, as a tidy player packs; an item that fits nowhere is skipped, so the
 * small ones fill the last gaps and the map ends 100 % full. The last placement is held back as
 * the current item: the round is still playing, and placing it is the final, heaviest rebuild.
 * Pure and seeded: the same seed gives the same city.
 */
export function demoFullGame(catalog: Catalog, settings: SceneSettings, seed: number): GameState {
  const occ = new Uint8Array(GRID_SIZE * GRID_SIZE);
  const placements: Placement[] = [];
  let bag: string[] = [];
  let rng = seed >>> 0;
  const random = (): number => {
    const r = nextRandom(rng);
    rng = r.state;
    return r.value;
  };
  const blocked = (x: number, z: number): boolean =>
    x < 0 || z < 0 || x >= GRID_SIZE || z >= GRID_SIZE || occ[z * GRID_SIZE + x] === 1;

  /** Best-touching spot for a footprint, ties broken at random; null if it fits nowhere. */
  const bestSpot = (id: string): { x: number; z: number; rotation: Rotation } | null => {
    const fp = catalog.items[id].footprint;
    let best: { x: number; z: number; rotation: Rotation }[] = [];
    let bestScore = -1;
    for (const r of fp.w === fp.d ? [0] as const : [0, 1] as const) {
      const { w, d } = rotatedFootprint(fp, r);
      for (let z = 0; z <= GRID_SIZE - d; z++) {
        for (let x = 0; x <= GRID_SIZE - w; x++) {
          if (!canPlace(occ, fp, r, x, z)) continue;
          let score = 0;
          for (let i = 0; i < w; i++) score += Number(blocked(x + i, z - 1)) + Number(blocked(x + i, z + d));
          for (let j = 0; j < d; j++) score += Number(blocked(x - 1, z + j)) + Number(blocked(x + w, z + j));
          if (score > bestScore) { bestScore = score; best = []; }
          if (score === bestScore) best.push({ x, z, rotation: r });
        }
      }
    }
    if (best.length === 0) return null;
    const spot = best[Math.floor(random() * best.length)];
    // r and r + 2 cover the same tiles: face either way
    return { ...spot, rotation: (spot.rotation + (random() < 0.5 ? 0 : 2)) as Rotation };
  };

  const take = (): string => {
    const d = draw(bag, catalog.order, rng);
    bag = d.bag;
    rng = d.rng;
    return d.id;
  };

  let misses = 0; // draws in a row that fit nowhere; a full bag of them means nothing fits
  while (misses < catalog.order.length) {
    const id = take();
    const spot = bestSpot(id);
    if (!spot) { misses++; continue; }
    misses = 0;
    placements.push({ uid: placements.length + 1, itemId: id, ...spot });
    const { w, d } = rotatedFootprint(catalog.items[id].footprint, spot.rotation);
    for (let z = spot.z; z < spot.z + d; z++) for (let x = spot.x; x < spot.x + w; x++) occ[z * GRID_SIZE + x] = 1;
  }

  const last = placements.pop();
  if (!last) throw new Error('demoFullGame: nothing could be placed');
  const next = take();
  return {
    themeId: catalog.themeId,
    settings: { ...settings },
    placements,
    bag,
    rng,
    current: last.itemId,
    next,
    status: 'playing',
    nextUid: last.uid,
    floors: emptyFloors(),
  };
}
