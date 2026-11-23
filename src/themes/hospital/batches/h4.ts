import type { ItemModel } from '../../../models/contract';
import { item as mriScanner } from '../items/mri-scanner';
import { item as xrayRoom } from '../items/xray-room';
import { item as dentalChair } from '../items/dental-chair';
import { item as eyeTestCorner } from '../items/eye-test-corner';
import { item as medicineCabinet } from '../items/medicine-cabinet';
import { item as handWashStation } from '../items/hand-wash-station';
import { item as heightChart } from '../items/height-chart';
import { item as babyScale } from '../items/baby-scale';
import { item as stoolPair } from '../items/stool-pair';

/**
 * Hospital batch h4 (the Batch column of docs/game/items-hospital.md):
 * mri-scanner, xray-room, dental-chair, eye-test-corner, medicine-cabinet, hand-wash-station, height-chart, baby-scale, stool-pair.
 * Owned by the h4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-4` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h4.test.ts`.
 */
export const items: readonly ItemModel[] = [mriScanner, xrayRoom, dentalChair, eyeTestCorner, medicineCabinet, handWashStation, heightChart, babyScale, stoolPair];
