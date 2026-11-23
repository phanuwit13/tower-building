import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h3 (the Batch column of docs/game/items-hospital.md):
 * nurse-station, recovery-bed, exam-room, hospital-bed, stretcher, wheelchair-pair, screen-divider, heart-monitor, aed-box.
 * Owned by the h3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-3` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
