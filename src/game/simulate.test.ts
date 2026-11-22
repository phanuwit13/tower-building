import { describe, expect, it } from 'vitest';
import { DEFAULT_MIX } from '../themes/mix';
import { catalogFromMix, planningPlacer, randomPlacer, simulateRounds } from './simulate';

// 20 x 20 rounds are long (~140 items), so 120 rounds keep this under ~3 s.
const ROUNDS = 120;

// Observed with DEFAULT_MIX (seed 1, random placer seed 7):
//   planning meanFill 99.7, p10Fill 99, meanItems 142.3; random meanFill 71.3, meanItems 102.7.
// Thresholds keep a safety margin: mean -5, p10 -10, and a band on item counts, so a skewed mix fails.
describe('footprint mix simulation', () => {
  const catalog = catalogFromMix(DEFAULT_MIX);

  it('has exactly 50 items', () => {
    expect(catalog.order.length).toBe(50);
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
  });
});
