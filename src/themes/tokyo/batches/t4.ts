import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t4 (the Batch column of docs/game/items-tokyo.md):
 * scramble-crossing, apartment-block, konbini, toy-shop, bicycle-parking, rickshaw, police-box, mailbox, trash-bins.
 * Owned by the t4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-4` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
