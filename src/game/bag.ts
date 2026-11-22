import { nextRandom } from './rng';

/** Fisher-Yates over a copy; returns the shuffled ids and the advanced rng state. */
export function shuffle(ids: readonly string[], rng: number): { ids: string[]; rng: number } {
  const out = [...ids];
  let state = rng;
  for (let i = out.length - 1; i > 0; i--) {
    const r = nextRandom(state);
    state = r.state;
    const j = Math.floor(r.value * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return { ids: out, rng: state };
}

/** Draw bag[0]; refills with a shuffled `order` when the bag is empty. Never mutates `bag`. */
export function draw(
  bag: readonly string[],
  order: readonly string[],
  rng: number,
): { id: string; bag: string[]; rng: number } {
  let pool = bag;
  let state = rng;
  if (pool.length === 0) {
    const s = shuffle(order, state);
    pool = s.ids;
    state = s.rng;
  }
  return { id: pool[0], bag: pool.slice(1), rng: state };
}
