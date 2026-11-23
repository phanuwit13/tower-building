import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h4 (the Batch column of docs/game/items-hospital.md):
 * mri-scanner, xray-room, dental-chair, eye-test-corner, medicine-cabinet, hand-wash-station, height-chart, baby-scale, stool-pair.
 * Owned by the h4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-4` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
