import type { ItemModel } from '../../../models/contract';
import { item as anchor } from '../items/anchor';
import { item as beachBuggy } from '../items/beach-buggy';
import { item as beachBungalow } from '../items/beach-bungalow';
import { item as fishBin } from '../items/fish-bin';
import { item as pedalBoat } from '../items/pedal-boat';
import { item as rockPool } from '../items/rock-pool';
import { item as seaSwing } from '../items/sea-swing';
import { item as tikiTorch } from '../items/tiki-torch';

/**
 * Beach batch c4 (the Batch column of docs/game/items-beach.md):
 * beach-bungalow, rock-pool, sea-swing, pedal-boat, beach-buggy, fish-bin, tiki-torch, anchor.
 * Review: `?gallery=beach-batch-4` on the dev server. Check: `npx vitest run src/themes/beach/batches/c4.test.ts`.
 */
export const items: readonly ItemModel[] = [beachBungalow, rockPool, seaSwing, pedalBoat, beachBuggy, fishBin, tikiTorch, anchor];
