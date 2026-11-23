import type { ItemModel } from '../../../models/contract';
import { item as outdoorGym } from '../items/outdoor-gym';
import { item as skatePark } from '../items/skate-park';
import { item as basketballCourt } from '../items/basketball-court';
import { item as bikeRental } from '../items/bike-rental';
import { item as joggingTrack } from '../items/jogging-track';
import { item as bikeRack } from '../items/bike-rack';
import { item as trashBins } from '../items/trash-bins';
import { item as vendingMachine } from '../items/vending-machine';
import { item as signpost } from '../items/signpost';

/**
 * Park batch p3 (the Batch column of docs/game/items-park.md):
 * outdoor-gym, skate-park, basketball-court, bike-rental, jogging-track, bike-rack, trash-bins, vending-machine, signpost.
 * Owned by the p3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-3` on the dev server. Check: `npx vitest run src/themes/park/batches/p3.test.ts`.
 */
export const items: readonly ItemModel[] = [
  outdoorGym,
  skatePark,
  basketballCourt,
  bikeRental,
  joggingTrack,
  bikeRack,
  trashBins,
  vendingMachine,
  signpost,
];
