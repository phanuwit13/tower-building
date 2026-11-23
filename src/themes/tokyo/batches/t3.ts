import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t3 (the Batch column of docs/game/items-tokyo.md):
 * train-station, shinkansen-viaduct, pedestrian-bridge, commuter-train, tram, taxi, kei-truck, bus-stop-sign, mama-bicycle.
 * Owned by the t3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-3` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
