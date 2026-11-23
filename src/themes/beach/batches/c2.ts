import type { ItemModel } from '../../../models/contract';
import { item as sailboatDock } from '../items/sailboat-dock';
import { item as seafoodRestaurant } from '../items/seafood-restaurant';
import { item as kayakRack } from '../items/kayak-rack';
import { item as coconutBar } from '../items/coconut-bar';
import { item as palmHammock } from '../items/palm-hammock';
import { item as boardwalkBench } from '../items/boardwalk-bench';
import { item as beachBall } from '../items/beach-ball';
import { item as starfish } from '../items/starfish';
import { item as giantShell } from '../items/giant-shell';

/**
 * Beach batch c2 (the Batch column of docs/game/items-beach.md):
 * sailboat-dock, seafood-restaurant, kayak-rack, coconut-bar, palm-hammock, boardwalk-bench, beach-ball, starfish, giant-shell.
 * Owned by the c2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-2` on the dev server. Check: `npx vitest run src/themes/beach/batches/c2.test.ts`.
 */
export const items: readonly ItemModel[] = [sailboatDock, seafoodRestaurant, kayakRack, coconutBar, palmHammock, boardwalkBench, beachBall, starfish, giantShell];
