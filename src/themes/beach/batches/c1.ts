import type { ItemModel } from '../../../models/contract';
import { item as pier } from '../items/pier';
import { item as lighthouse } from '../items/lighthouse';
import { item as sandcastle } from '../items/sandcastle';
import { item as lifeguard_tower } from '../items/lifeguard-tower';
import { item as sunloungers } from '../items/sunloungers';
import { item as umbrella_mat } from '../items/umbrella-mat';
import { item as longtail_boat } from '../items/longtail-boat';
import { item as palm_tree } from '../items/palm-tree';
import { item as sand_bucket } from '../items/sand-bucket';

/**
 * Beach batch c1 (the Batch column of docs/game/items-beach.md):
 * pier, lighthouse, sandcastle, lifeguard-tower, sunloungers, umbrella-mat, longtail-boat, palm-tree, sand-bucket.
 * Owned by the c1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-1` on the dev server. Check: `npx vitest run src/themes/beach/batches/c1.test.ts`.
 */
export const items: readonly ItemModel[] = [pier, lighthouse, sandcastle, lifeguard_tower, sunloungers, umbrella_mat, longtail_boat, palm_tree, sand_bucket];
