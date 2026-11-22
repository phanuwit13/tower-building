import type { ItemModel } from '../../../models/contract';
import { item as basketballCourt } from '../items/basketball-court';
import { item as busStop } from '../items/bus-stop';
import { item as footballPitch } from '../items/football-pitch';
import { item as gardenShed } from '../items/garden-shed';
import { item as jungleGym } from '../items/jungle-gym';
import { item as merryGoRound } from '../items/merry-go-round';
import { item as pavilion } from '../items/pavilion';
import { item as sandpit } from '../items/sandpit';
import { item as waterTower } from '../items/water-tower';

/**
 * School batch 2: football-pitch, basketball-court, pavilion, merry-go-round, jungle-gym, sandpit, bus-stop, garden-shed, water-tower.
 * Owned by the batch-2 sculptor; do not edit other batches.
 * Review: `?gallery=batch-2` on the dev server. Check: `npx vitest run src/themes/school/batches/b2.test.ts`.
 */
export const items: readonly ItemModel[] = [
  footballPitch, basketballCourt, pavilion, merryGoRound, jungleGym, sandpit, busStop, gardenShed, waterTower,
];
