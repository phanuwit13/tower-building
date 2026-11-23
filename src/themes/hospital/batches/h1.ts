import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h1 (the Batch column of docs/game/items-hospital.md):
 * reception-desk, waiting-area, vending-corner, gift-shop-corner, bench-seats, info-kiosk, water-dispenser, sanitizer-stand, umbrella-stand.
 * Owned by the h1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-1` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
