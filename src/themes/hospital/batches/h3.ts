import type { ItemModel } from '../../../models/contract';
import { item as nurse_station } from '../items/nurse-station';
import { item as recovery_bed } from '../items/recovery-bed';
import { item as exam_room } from '../items/exam-room';
import { item as hospital_bed } from '../items/hospital-bed';
import { item as stretcher } from '../items/stretcher';
import { item as wheelchair_pair } from '../items/wheelchair-pair';
import { item as screen_divider } from '../items/screen-divider';
import { item as heart_monitor } from '../items/heart-monitor';
import { item as aed_box } from '../items/aed-box';

/**
 * Hospital batch h3 (the Batch column of docs/game/items-hospital.md):
 * nurse-station, recovery-bed, exam-room, hospital-bed, stretcher, wheelchair-pair, screen-divider, heart-monitor, aed-box.
 * Owned by the h3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-3` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h3.test.ts`.
 */
export const items: readonly ItemModel[] = [nurse_station, recovery_bed, exam_room, hospital_bed, stretcher, wheelchair_pair, screen_divider, heart_monitor, aed_box];
