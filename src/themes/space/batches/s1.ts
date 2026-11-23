import type { ItemModel } from '../../../models/contract';
import { item as launchPad } from '../items/launch-pad';
import { item as spaceportRunway } from '../items/spaceport-runway';
import { item as fuelTanks } from '../items/fuel-tanks';
import { item as landingPadSmall } from '../items/landing-pad-small';
import { item as miniRocket } from '../items/mini-rocket';
import { item as lunarLander } from '../items/lunar-lander';
import { item as fuelPump } from '../items/fuel-pump';
import { item as beacon } from '../items/beacon';
import { item as missionSign } from '../items/mission-sign';

/**
 * Space batch s1 (the Batch column of docs/game/items-space.md):
 * launch-pad, spaceport-runway, fuel-tanks, landing-pad-small, mini-rocket, lunar-lander, fuel-pump, beacon, mission-sign.
 * Owned by the s1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-1` on the dev server. Check: `npx vitest run src/themes/space/batches/s1.test.ts`.
 */
export const items: readonly ItemModel[] = [
  launchPad,
  spaceportRunway,
  fuelTanks,
  landingPadSmall,
  miniRocket,
  lunarLander,
  fuelPump,
  beacon,
  missionSign,
];
