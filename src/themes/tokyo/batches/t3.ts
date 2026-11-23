import type { ItemModel } from '../../../models/contract';
import { item as trainStation } from '../items/train-station';
import { item as shinkansenViaduct } from '../items/shinkansen-viaduct';
import { item as pedestrianBridge } from '../items/pedestrian-bridge';
import { item as commuterTrain } from '../items/commuter-train';
import { item as tram } from '../items/tram';
import { item as taxi } from '../items/taxi';
import { item as keiTruck } from '../items/kei-truck';
import { item as busStopSign } from '../items/bus-stop-sign';
import { item as mamaBicycle } from '../items/mama-bicycle';

/**
 * Tokyo batch t3 (the Batch column of docs/game/items-tokyo.md):
 * train-station, shinkansen-viaduct, pedestrian-bridge, commuter-train, tram, taxi, kei-truck, bus-stop-sign, mama-bicycle.
 * Owned by the t3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-3` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t3.test.ts`.
 */
export const items: readonly ItemModel[] = [trainStation, shinkansenViaduct, pedestrianBridge, commuterTrain, tram, taxi, keiTruck, busStopSign, mamaBicycle];
