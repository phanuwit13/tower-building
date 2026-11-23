import type { ItemModel } from '../../../models/contract';
import { item as skyscraperOffice } from '../items/skyscraper-office';
import { item as departmentStore } from '../items/department-store';
import { item as capsuleHotel } from '../items/capsule-hotel';
import { item as karaokeBuilding } from '../items/karaoke-building';
import { item as neonSignTower } from '../items/neon-sign-tower';
import { item as vendingMachines } from '../items/vending-machines';
import { item as streetLamp } from '../items/street-lamp';
import { item as electricPole } from '../items/electric-pole';
import { item as trafficLight } from '../items/traffic-light';

/**
 * Tokyo batch t2 (the Batch column of docs/game/items-tokyo.md):
 * skyscraper-office, department-store, capsule-hotel, karaoke-building, neon-sign-tower, vending-machines, street-lamp, electric-pole, traffic-light.
 * Owned by the t2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-2` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t2.test.ts`.
 */
export const items: readonly ItemModel[] = [skyscraperOffice, departmentStore, capsuleHotel, karaokeBuilding, neonSignTower, vendingMachines, streetLamp, electricPole, trafficLight];
