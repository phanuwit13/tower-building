import type { ItemModel } from '../../../models/contract';
import { item as habitatDome } from '../items/habitat-dome';
import { item as commandCenter } from '../items/command-center';
import { item as airlockHub } from '../items/airlock-hub';
import { item as spaceCafe } from '../items/space-cafe';
import { item as tubeCorridor } from '../items/tube-corridor';
import { item as airTanks } from '../items/air-tanks';
import { item as baseLamp } from '../items/base-lamp';
import { item as supplyCrate } from '../items/supply-crate';
import { item as helperRobot } from '../items/helper-robot';

/**
 * Space batch s2 (the Batch column of docs/game/items-space.md):
 * habitat-dome, command-center, airlock-hub, space-cafe, tube-corridor, air-tanks, base-lamp, supply-crate, helper-robot.
 * Owned by the s2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-2` on the dev server. Check: `npx vitest run src/themes/space/batches/s2.test.ts`.
 */
export const items: readonly ItemModel[] = [habitatDome, commandCenter, airlockHub, spaceCafe, tubeCorridor, airTanks, baseLamp, supplyCrate, helperRobot];
