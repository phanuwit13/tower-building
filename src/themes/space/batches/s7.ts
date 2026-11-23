import type { ItemModel } from '../../../models/contract';
import { item as greenhouseDome } from '../items/greenhouse-dome';
import { item as robotWorkshop } from '../items/robot-workshop';
import { item as ufoVisitor } from '../items/ufo-visitor';
import { item as commsTower } from '../items/comms-tower';
import { item as cargoCrane } from '../items/cargo-crane';
import { item as crateStack } from '../items/crate-stack';
import { item as alienBuddy } from '../items/alien-buddy';
import { item as spacePlant } from '../items/space-plant';

/**
 * Space batch s7 (the Batch column of docs/game/items-space.md):
 * greenhouse-dome, robot-workshop, ufo-visitor, comms-tower, cargo-crane, crate-stack, alien-buddy, space-plant.
 * Owned by the s7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-7` on the dev server. Check: `npx vitest run src/themes/space/batches/s7.test.ts`.
 */
export const items: readonly ItemModel[] = [greenhouseDome, robotWorkshop, ufoVisitor, commsTower, cargoCrane, crateStack, alienBuddy, spacePlant];
