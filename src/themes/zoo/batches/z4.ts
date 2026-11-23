import type { ItemModel } from '../../../models/contract';
import { item as bananaCrate } from '../items/banana-crate';
import { item as birdAviary } from '../items/bird-aviary';
import { item as camelPen } from '../items/camel-pen';
import { item as duckTub } from '../items/duck-tub';
import { item as flamingoPond } from '../items/flamingo-pond';
import { item as flowerBush } from '../items/flower-bush';
import { item as otterStream } from '../items/otter-stream';
import { item as zooGate } from '../items/zoo-gate';

/**
 * Zoo batch z4 (the Batch column of docs/game/items-zoo.md):
 * zoo-gate, flamingo-pond, bird-aviary, otter-stream, camel-pen, duck-tub, banana-crate, flower-bush.
 * Owned by the z4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-4` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z4.test.ts`.
 */
export const items: readonly ItemModel[] = [zooGate, flamingoPond, birdAviary, otterStream, camelPen, duckTub, bananaCrate, flowerBush];
