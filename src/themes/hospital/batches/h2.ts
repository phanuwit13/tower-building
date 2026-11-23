import type { ItemModel } from '../../../models/contract';
import { item as kidsWardBeds } from '../items/kids-ward-beds';
import { item as playroom } from '../items/playroom';
import { item as readingCorner } from '../items/reading-corner';
import { item as babyNursery } from '../items/baby-nursery';
import { item as artWall } from '../items/art-wall';
import { item as bookshelfLow } from '../items/bookshelf-low';
import { item as toyCar } from '../items/toy-car';
import { item as rockingHorse } from '../items/rocking-horse';
import { item as teddyBear } from '../items/teddy-bear';

/**
 * Hospital batch h2 (the Batch column of docs/game/items-hospital.md):
 * kids-ward-beds, playroom, reading-corner, baby-nursery, art-wall, bookshelf-low, toy-car, rocking-horse, teddy-bear.
 * Owned by the h2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-2` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h2.test.ts`.
 */
export const items: readonly ItemModel[] = [kidsWardBeds, playroom, readingCorner, babyNursery, artWall, bookshelfLow, toyCar, rockingHorse, teddyBear];
