import type { ItemModel } from '../../../models/contract';
import { item as fishPond } from '../items/fish-pond';
import { item as lotusPond } from '../items/lotus-pond';
import { item as watersidePavilion } from '../items/waterside-pavilion';
import { item as footbridge } from '../items/footbridge';
import { item as rowboat } from '../items/rowboat';
import { item as waterJars } from '../items/water-jars';
import { item as handPump } from '../items/hand-pump';
import { item as fireflyBush } from '../items/firefly-bush';
import { item as bambooClump } from '../items/bamboo-clump';

/**
 * Village batch v4 (the Batch column of docs/game/items-village.md):
 * fish-pond, lotus-pond, waterside-pavilion, footbridge, rowboat, water-jars, hand-pump, firefly-bush, bamboo-clump.
 * Owned by the v4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-4` on the dev server. Check: `npx vitest run src/themes/village/batches/v4.test.ts`.
 */
export const items: readonly ItemModel[] = [fishPond, lotusPond, watersidePavilion, footbridge, rowboat, waterJars, handPump, fireflyBush, bambooClump];
