import type { ItemModel } from '../../../models/contract';
import { item as ricePaddy } from '../items/rice-paddy';
import { item as riceMill } from '../items/rice-mill';
import { item as dryingYard } from '../items/drying-yard';
import { item as haystacks } from '../items/haystacks';
import { item as walkingTractor } from '../items/walking-tractor';
import { item as farmTruck } from '../items/farm-truck';
import { item as scarecrow } from '../items/scarecrow';
import { item as pinwheel } from '../items/pinwheel';
import { item as waterBuffalo } from '../items/water-buffalo';

/**
 * Village batch v2 (the Batch column of docs/game/items-village.md):
 * rice-paddy, rice-mill, drying-yard, haystacks, walking-tractor, farm-truck, scarecrow, pinwheel, water-buffalo.
 * Owned by the v2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-2` on the dev server. Check: `npx vitest run src/themes/village/batches/v2.test.ts`.
 */
export const items: readonly ItemModel[] = [ricePaddy, riceMill, dryingYard, haystacks, walkingTractor, farmTruck, scarecrow, pinwheel, waterBuffalo];
