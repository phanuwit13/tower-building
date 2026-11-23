import { draw } from './bag';
import { canPlace, rotatedFootprint } from './grid';
import { nextRandom } from './rng';
import { FLOOR_TILES } from '../floors';
import { emptyFloors, paintRect } from './floors';
import { GRID_SIZE, type Catalog, type GameState, type Placement, type Rotation, type SceneSettings } from './types';

/**
 * Dev aid for `?demo=full`: a round played to the end, for measuring a full map. Items come
 * from the shuffle bag (so the first 50 are every type once) and go where they touch the most
 * border or neighbours, as a tidy player packs; an item that fits nowhere is skipped, so the
 * small ones fill the last gaps and the map ends 100 % full. The last placement is held back as
 * the current item: the round is still playing, and placing it is the final, heaviest rebuild.
 * The floors cover the whole map with every tile (see demoFloors).
 * Pure and seeded: the same seed gives the same city.
 */
const PLAZA_W = 4;
const PLAZA_D = 3;

/**
 * The demo's floors: the whole map in plazas (4 x 3 blocks), each block one tile, dealt from a
 * seeded shuffle of the registry so every tile shows at least once; then a cross of one-cell
 * paths over them. Uses its own rng, so the items' placements do not depend on it.
 */
export function demoFloors(seed: number): (string | null)[] {
  const ids = FLOOR_TILES.map((t) => t.id);
  let rng = (seed ^ 0x9e3779b9) >>> 0;
  const random = (): number => {
    const r = nextRandom(rng);
    rng = r.state;
    return r.value;
  };
  const deck = [...ids];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  let floors = emptyFloors();
  let n = 0;
  for (let z = 0; z < GRID_SIZE; z += PLAZA_D) {
    for (let x = 0; x < GRID_SIZE; x += PLAZA_W) {
      const id = n < deck.length ? deck[n] : ids[Math.floor(random() * ids.length)];
      n++;
      floors = paintRect(floors, { x0: x, z0: z, x1: x + PLAZA_W - 1, z1: z + PLAZA_D - 1 }, id);
    }
  }
  const pathA = ids[Math.floor(random() * ids.length)];
  const pathB = ids[Math.floor(random() * ids.length)];
  floors = paintRect(floors, { x0: 0, z0: 9, x1: GRID_SIZE - 1, z1: 9 }, pathA);
  floors = paintRect(floors, { x0: 9, z0: 0, x1: 9, z1: GRID_SIZE - 1 }, pathB);
  return floors;
}

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
    floors: demoFloors(seed),
  };
}
