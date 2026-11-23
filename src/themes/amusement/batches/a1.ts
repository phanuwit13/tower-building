import type { ItemModel } from '../../../models/contract';
import { item as ferris_wheel } from '../items/ferris-wheel';
import { item as carousel } from '../items/carousel';
import { item as teacups } from '../items/teacups';
import { item as ticket_booth } from '../items/ticket-booth';
import { item as ring_toss } from '../items/ring-toss';
import { item as light_pole } from '../items/light-pole';
import { item as mascot_bear } from '../items/mascot-bear';
import { item as frog_bin } from '../items/frog-bin';
import { item as park_map } from '../items/park-map';

/**
 * Amusement batch a1 (the Batch column of docs/game/items-amusement.md):
 * ferris-wheel, carousel, teacups, ticket-booth, ring-toss, light-pole, mascot-bear, frog-bin, park-map.
 * Owned by the a1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-1` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a1.test.ts`.
 */
export const items: readonly ItemModel[] = [
  ferris_wheel,
  carousel,
  teacups,
  ticket_booth,
  ring_toss,
  light_pole,
  mascot_bear,
  frog_bin,
  park_map,
];
