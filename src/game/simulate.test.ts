import { describe, expect, it } from 'vitest';
import { DEFAULT_MIX } from '../themes/mix';
import { catalogFromMix, planningPlacer, randomPlacer, simulateRounds } from './simulate';

describe('footprint mix simulation', () => {
  const catalog = catalogFromMix(DEFAULT_MIX);

  it('has at least 40 items', () => {
    expect(catalog.order.length).toBeGreaterThanOrEqual(40);
  });

  it('planning pays off and bad luck rarely ends a round early', () => {
    const planning = simulateRounds(catalog, planningPlacer, 500, 1);
    const random = simulateRounds(catalog, randomPlacer(7), 500, 1);
    expect(planning.meanFill).toBeGreaterThanOrEqual(80);
    expect(random.meanFill).toBeLessThanOrEqual(planning.meanFill - 10);
    expect(planning.p10Fill).toBeGreaterThanOrEqual(60);
  });
});
