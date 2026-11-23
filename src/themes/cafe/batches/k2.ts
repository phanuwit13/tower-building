import type { ItemModel } from '../../../models/contract';
import { item as sofaLounge } from '../items/sofa-lounge';
import { item as bookNook } from '../items/book-nook';
import { item as armchairsPair } from '../items/armchairs-pair';
import { item as boardGameTable } from '../items/board-game-table';
import { item as bookshelf } from '../items/bookshelf';
import { item as loveseat } from '../items/loveseat';
import { item as floorLamp } from '../items/floor-lamp';
import { item as rockingChair } from '../items/rocking-chair';
import { item as vaseTable } from '../items/vase-table';

/**
 * Café batch k2 (the Batch column of docs/game/items-cafe.md):
 * sofa-lounge, book-nook, armchairs-pair, board-game-table, bookshelf, loveseat, floor-lamp, rocking-chair, vase-table.
 * Owned by the k2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-2` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k2.test.ts`.
 */
export const items: readonly ItemModel[] = [sofaLounge, bookNook, armchairsPair, boardGameTable, bookshelf, loveseat, floorLamp, rockingChair, vaseTable];
