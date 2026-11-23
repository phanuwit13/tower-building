import type { ItemModel } from '../../../models/contract';
import { item as physioRoom } from '../items/physio-room';
import { item as doctorOffice } from '../items/doctor-office';
import { item as plantAtrium } from '../items/plant-atrium';
import { item as treadmill } from '../items/treadmill';
import { item as sofa } from '../items/sofa';
import { item as therapyDog } from '../items/therapy-dog';
import { item as flowerVaseTable } from '../items/flower-vase-table';
import { item as pottedPlant } from '../items/potted-plant';

/**
 * Hospital batch h5 (the Batch column of docs/game/items-hospital.md):
 * physio-room, doctor-office, plant-atrium, treadmill, sofa, therapy-dog, flower-vase-table, potted-plant.
 * Owned by the h5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-5` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h5.test.ts`.
 */
export const items: readonly ItemModel[] = [physioRoom, doctorOffice, plantAtrium, treadmill, sofa, therapyDog, flowerVaseTable, pottedPlant];
