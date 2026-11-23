import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t2 (the Batch column of docs/game/items-tokyo.md):
 * skyscraper-office, department-store, capsule-hotel, karaoke-building, neon-sign-tower, vending-machines, street-lamp, electric-pole, traffic-light.
 * Owned by the t2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-2` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
