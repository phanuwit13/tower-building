import type { ItemModel } from '../../../models/contract';
import { item as scrambleCrossing } from '../items/scramble-crossing';
import { item as apartmentBlock } from '../items/apartment-block';
import { item as konbini } from '../items/konbini';
import { item as toyShop } from '../items/toy-shop';
import { item as bicycleParking } from '../items/bicycle-parking';
import { item as rickshaw } from '../items/rickshaw';
import { item as policeBox } from '../items/police-box';
import { item as mailbox } from '../items/mailbox';
import { item as trashBins } from '../items/trash-bins';

/**
 * Tokyo batch t4 (the Batch column of docs/game/items-tokyo.md):
 * scramble-crossing, apartment-block, konbini, toy-shop, bicycle-parking, rickshaw, police-box, mailbox, trash-bins.
 * Owned by the t4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-4` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t4.test.ts`.
 */
export const items: readonly ItemModel[] = [
  scrambleCrossing,
  apartmentBlock,
  konbini,
  toyShop,
  bicycleParking,
  rickshaw,
  policeBox,
  mailbox,
  trashBins,
];
