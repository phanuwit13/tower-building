import type { ItemModel } from '../../../models/contract';
import { item as iceCrater } from '../items/ice-crater';
import { item as bigCrater } from '../items/big-crater';
import { item as moonRocks } from '../items/moon-rocks';
import { item as landingLights } from '../items/landing-lights';
import { item as crystalCluster } from '../items/crystal-cluster';
import { item as moonBoulder } from '../items/moon-boulder';
import { item as smallCrater } from '../items/small-crater';
import { item as meteorite } from '../items/meteorite';

/**
 * Space batch s6 (the Batch column of docs/game/items-space.md):
 * ice-crater, big-crater, moon-rocks, landing-lights, crystal-cluster, moon-boulder, small-crater, meteorite.
 * Owned by the s6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-6` on the dev server. Check: `npx vitest run src/themes/space/batches/s6.test.ts`.
 */
export const items: readonly ItemModel[] = [iceCrater, bigCrater, moonRocks, landingLights, crystalCluster, moonBoulder, smallCrater, meteorite];
