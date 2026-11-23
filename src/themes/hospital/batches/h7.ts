import type { ItemModel } from '../../../models/contract';
import { item as hospital_cafe } from '../items/hospital-cafe';
import { item as elevator_lobby } from '../items/elevator-lobby';
import { item as aquarium_tank } from '../items/aquarium-tank';
import { item as plant_planter } from '../items/plant-planter';
import { item as recycle_bins } from '../items/recycle-bins';
import { item as air_purifier } from '../items/air-purifier';
import { item as toy_mobile } from '../items/toy-mobile';
import { item as balloon_bunch } from '../items/balloon-bunch';

/**
 * Hospital batch h7 (the Batch column of docs/game/items-hospital.md):
 * hospital-cafe, elevator-lobby, aquarium-tank, plant-planter, recycle-bins, air-purifier, toy-mobile, balloon-bunch.
 * Owned by the h7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-7` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h7.test.ts`.
 */
export const items: readonly ItemModel[] = [
  hospital_cafe,
  elevator_lobby,
  aquarium_tank,
  plant_planter,
  recycle_bins,
  air_purifier,
  toy_mobile,
  balloon_bunch,
];
