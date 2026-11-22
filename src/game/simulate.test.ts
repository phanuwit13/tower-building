import { describe, expect, it } from 'vitest';
import { DEFAULT_MIX } from '../themes/mix';
import { catalogFromMix, planningPlacer, randomPlacer, simulateRounds } from './simulate';

const ROUNDS = 120;

describe('footprint mix simulation', () => {
  const catalog = catalogFromMix(DEFAULT_MIX);

  it('has at least 40 items', () => {
    expect(catalog.order.length).toBeGreaterThanOrEqual(40);
  });

  it('planning pays off and bad luck rarely ends a round early', () => {
    // 20 x 20 rounds are ~4x longer than the old 10 x 10 ones, so 120 rounds (was 500) keep this under ~3 s.
    const planning = simulateRounds(catalog, planningPlacer, ROUNDS, 1);
    const random = simulateRounds(catalog, randomPlacer(7), ROUNDS, 1);
    expect(planning.meanFill).toBeGreaterThanOrEqual(80);
    expect(random.meanFill).toBeLessThanOrEqual(planning.meanFill - 10);
    expect(planning.p10Fill).toBeGreaterThanOrEqual(60);
  });
});
