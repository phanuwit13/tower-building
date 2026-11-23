import type { ItemModel } from '../../../models/contract';
import { item as observatory } from '../items/observatory';
import { item as labModule } from '../items/lab-module';
import { item as telescopeArray } from '../items/telescope-array';
import { item as radarDish } from '../items/radar-dish';
import { item as satelliteStand } from '../items/satellite-stand';
import { item as starTelescope } from '../items/star-telescope';
import { item as miniDish } from '../items/mini-dish';
import { item as sensorPole } from '../items/sensor-pole';
import { item as antenna } from '../items/antenna';

/**
 * Space batch s3 (the Batch column of docs/game/items-space.md):
 * observatory, lab-module, telescope-array, radar-dish, satellite-stand, star-telescope, mini-dish, sensor-pole, antenna.
 * Owned by the s3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-3` on the dev server. Check: `npx vitest run src/themes/space/batches/s3.test.ts`.
 */
export const items: readonly ItemModel[] = [observatory, labModule, telescopeArray, radarDish, satelliteStand, starTelescope, miniDish, sensorPole, antenna];
