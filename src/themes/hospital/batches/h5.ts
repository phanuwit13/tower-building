import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h5 (the Batch column of docs/game/items-hospital.md):
 * physio-room, doctor-office, plant-atrium, treadmill, sofa, therapy-dog, flower-vase-table, potted-plant.
 * Owned by the h5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-5` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
