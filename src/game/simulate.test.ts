import { describe, expect, it } from 'vitest';
import type { FootprintMix } from './types';
import { AMUSEMENT_MIX, BEACH_MIX, CAFE_MIX, DEFAULT_MIX, MARKET_MIX, VILLAGE_MIX, ZOO_MIX, PARK_MIX, HOSPITAL_MIX, SPACE_MIX } from '../themes/mix';
import { catalogFromMix, planningPlacer, randomPlacer, simulateRounds } from './simulate';

// 20 x 20 rounds are long (~140 items), so 120 rounds keep this to about 2 s a mix on its own; in the
// full suite, with every worker busy, it can pass the default 5 s timeout, so it gets more.
const ROUNDS = 120;
const TIMEOUT_MS = 20_000;

// Observed (seed 1, random placer seed 7):
//   School (DEFAULT_MIX) planning meanFill 99.7, p10Fill 99, meanItems 142.3; random meanFill 71.3, meanItems 102.7.
//   Amusement (AMUSEMENT_MIX) planning meanFill 99.6, p10Fill 99, meanItems 136.9; random meanFill 70.9, meanItems 98.0.
//   Zoo (ZOO_MIX) planning meanFill 99.6, p10Fill 99, meanItems 141.8; random meanFill 70.0, meanItems 99.5.
//   Market (MARKET_MIX) planning meanFill 99.7, p10Fill 99, meanItems 142.7; random meanFill 71.0, meanItems 102.1.
// Every theme's mix must meet the same targets. Thresholds keep a safety margin: mean -5, p10 -10,
// and a band on item counts, so a skewed mix fails.
const MIXES: [string, FootprintMix, number][] = [
  ['school', DEFAULT_MIX, 50],
  ['amusement', AMUSEMENT_MIX, 53],
  ['zoo', ZOO_MIX, 60],
  ['beach', BEACH_MIX, 60],
  ['market', MARKET_MIX, 70],
  ['cafe', CAFE_MIX, 60],
  ['village', VILLAGE_MIX, 60],
  ['park', PARK_MIX, 60],
  ['hospital', HOSPITAL_MIX, 60],
  ['space', SPACE_MIX, 60],
];

for (const [theme, mix, size] of MIXES) {
  describe(`footprint mix simulation: ${theme}`, () => {
    const catalog = catalogFromMix(mix);

    it(`has exactly ${size} items`, () => {
      expect(catalog.order.length).toBe(size);
    });

    it('planning pays off and bad luck rarely ends a round early', () => {
      const planning = simulateRounds(catalog, planningPlacer, ROUNDS, 1);
      const random = simulateRounds(catalog, randomPlacer(7), ROUNDS, 1);
      expect(planning.meanFill).toBeGreaterThanOrEqual(94);
      expect(planning.p10Fill).toBeGreaterThanOrEqual(89);
      expect(random.meanFill).toBeLessThanOrEqual(planning.meanFill - 15);
      expect(planning.meanItems).toBeGreaterThanOrEqual(110);
      expect(planning.meanItems).toBeLessThanOrEqual(175);
      expect(random.meanItems).toBeLessThan(planning.meanItems);
    }, TIMEOUT_MS);
  });
}
