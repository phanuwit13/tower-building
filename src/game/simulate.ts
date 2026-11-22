import { GRID_SIZE, type Catalog, type ItemSpec, type GameState, type Rotation } from './types';
import { buildOccupancy, canPlace, fillStats, rotatedFootprint } from './grid';
import { newGame, placeCurrent } from './game';
import { nextRandom } from './rng';

export type Placer = (s: GameState, c: Catalog) => { x: number; z: number; rotation: Rotation } | null;
export type FootprintMix = Record<'1x1' | '1x2' | '2x2' | '2x3', number>;

const FOOTPRINTS: Record<keyof FootprintMix, { w: number; d: number }> = {
  '1x1': { w: 1, d: 1 },
  '1x2': { w: 1, d: 2 },
  '2x2': { w: 2, d: 2 },
  '2x3': { w: 2, d: 3 },
};

/** Distinct rotations: quarter turns 2 and 3 repeat 0 and 1. */
function rotations(w: number, d: number): Rotation[] {
  return w === d ? [0] : [0, 1];
}

export function randomPlacer(seed: number): Placer {
  let rng = seed >>> 0;
  return (s, c) => {
    const fp = c.items[s.current].footprint;
    const occ = buildOccupancy(s.placements, c);
    const spots: { x: number; z: number; rotation: Rotation }[] = [];
    for (const rotation of rotations(fp.w, fp.d)) {
      const { w, d } = rotatedFootprint(fp, rotation);
      for (let z = 0; z <= GRID_SIZE - d; z++) {
        for (let x = 0; x <= GRID_SIZE - w; x++) {
          if (canPlace(occ, fp, rotation, x, z)) spots.push({ x, z, rotation });
        }
      }
    }
    if (spots.length === 0) return null;
    const r = nextRandom(rng);
    rng = r.state;
    return spots[Math.floor(r.value * spots.length)];
  };
}

/** Greedy: maximise footprint edges touching the border or occupied tiles; ties → smaller z, x, rotation. */
export const planningPlacer: Placer = (s, c) => {
  const fp = c.items[s.current].footprint;
  const occ = buildOccupancy(s.placements, c);
  const blocked = (x: number, z: number): boolean =>
    x < 0 || z < 0 || x >= GRID_SIZE || z >= GRID_SIZE || occ[z * GRID_SIZE + x] === 1;
  let best: { x: number; z: number; rotation: Rotation } | null = null;
  let bestScore = -1;
  for (const rotation of rotations(fp.w, fp.d)) {
    const { w, d } = rotatedFootprint(fp, rotation);
    for (let z = 0; z <= GRID_SIZE - d; z++) {
      for (let x = 0; x <= GRID_SIZE - w; x++) {
        if (!canPlace(occ, fp, rotation, x, z)) continue;
        let score = 0;
        for (let i = 0; i < w; i++) {
          if (blocked(x + i, z - 1)) score++;
          if (blocked(x + i, z + d)) score++;
        }
        for (let j = 0; j < d; j++) {
          if (blocked(x - 1, z + j)) score++;
          if (blocked(x + w, z + j)) score++;
        }
        if (score > bestScore) {
          bestScore = score;
          best = { x, z, rotation };
        }
      }
    }
  }
  return best;
};

export function catalogFromMix(mix: FootprintMix): Catalog {
  const items: Record<string, ItemSpec> = {};
  const order: string[] = [];
  for (const key of Object.keys(FOOTPRINTS) as (keyof FootprintMix)[]) {
    for (let i = 0; i < mix[key]; i++) {
      const id = `${key}-${i}`;
      items[id] = { id, footprint: FOOTPRINTS[key] };
      order.push(id);
    }
  }
  return { themeId: 'sim', order, items };
}

export function simulateRounds(
  c: Catalog, p: Placer, rounds: number, seed: number,
): { meanFill: number; p10Fill: number; meanItems: number } {
  const settings = { weather: 'sunny', time: 'day', ground: 'grass' } as const;
  const fills: number[] = [];
  let totalItems = 0;
  for (let i = 0; i < rounds; i++) {
    let state: GameState = newGame(c, settings, (seed + Math.imul(i, 0x9e3779b1)) >>> 0);
    while (state.status === 'playing') {
      const spot = p(state, c);
      if (!spot) break;
      const nxt = placeCurrent(state, c, spot.x, spot.z, spot.rotation);
      if (!nxt) break;
      state = nxt;
    }
    const stats = fillStats(state.placements, c);
    fills.push(stats.percent);
    totalItems += stats.items;
  }
  fills.sort((a, b) => a - b);
  const mean = (a: number[]): number => a.reduce((t, v) => t + v, 0) / a.length;
  return {
    meanFill: mean(fills),
    p10Fill: fills[Math.floor(fills.length * 0.1)],
    meanItems: totalItems / rounds,
  };
}
