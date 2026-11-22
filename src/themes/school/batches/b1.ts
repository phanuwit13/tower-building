import type { ItemModel } from '../../../models/contract';
import { item as assemblyHall } from '../items/assembly-hall';
import { item as canteen } from '../items/canteen';
import { item as greenhouse } from '../items/greenhouse';
import { item as library } from '../items/library';
import { item as schoolBus } from '../items/school-bus';
import { item as scienceLab } from '../items/science-lab';
import { item as swimmingPool } from '../items/swimming-pool';

/**
 * School batch 1: library, canteen, school-bus, assembly-hall, science-lab, greenhouse, swimming-pool.
 * Owned by the batch-1 sculptor; do not edit other batches.
 * Review: `?gallery=batch-1` on the dev server. Check: `npx vitest run src/themes/school/batches/b1.test.ts`.
 */
export const items: readonly ItemModel[] = [library, canteen, schoolBus, assemblyHall, scienceLab, greenhouse, swimmingPool];
