import type { ItemModel } from '../../../models/contract';
import { item as bellStand } from '../items/bell-stand';
import { item as drinkingFountain } from '../items/drinking-fountain';
import { item as globeStand } from '../items/globe-stand';
import { item as handwashTrough } from '../items/handwash-trough';
import { item as signpost } from '../items/signpost';
import { item as trashBins } from '../items/trash-bins';

/**
 * School batch 6: trash-bins, drinking-fountain, bell-stand, globe-stand, signpost, handwash-trough.
 * Owned by the batch-6 sculptor; do not edit other batches.
 * Review: `?gallery=batch-6` on the dev server. Check: `npx vitest run src/themes/school/batches/b6.test.ts`.
 */
export const items: readonly ItemModel[] = [trashBins, drinkingFountain, bellStand, globeStand, signpost, handwashTrough];
