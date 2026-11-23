import type { ItemModel } from '../../../models/contract';
import { item as arcadeCenter } from '../items/arcade-center';
import { item as catCafe } from '../items/cat-cafe';
import { item as teaHouse } from '../items/tea-house';
import { item as koinoboriPole } from '../items/koinobori-pole';
import { item as lanternRow } from '../items/lantern-row';
import { item as wagasaStand } from '../items/wagasa-stand';
import { item as shibaDog } from '../items/shiba-dog';
import { item as calicoCat } from '../items/calico-cat';

/**
 * Tokyo batch t6 (the Batch column of docs/game/items-tokyo.md):
 * arcade-center, cat-cafe, tea-house, koinobori-pole, lantern-row, wagasa-stand, shiba-dog, calico-cat.
 * Owned by the t6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-6` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t6.test.ts`.
 */
export const items: readonly ItemModel[] = [
  arcadeCenter,
  catCafe,
  teaHouse,
  koinoboriPole,
  lanternRow,
  wagasaStand,
  shibaDog,
  calicoCat,
];
