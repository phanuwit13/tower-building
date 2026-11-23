import type { ItemModel } from '../../../models/contract';
import { item as waterSlide } from '../items/water-slide';
import { item as volleyballCourt } from '../items/volleyball-court';
import { item as beachPavilion } from '../items/beach-pavilion';
import { item as shellIceCream } from '../items/shell-ice-cream';
import { item as bbqGrill } from '../items/bbq-grill';
import { item as welcomeSign } from '../items/welcome-sign';
import { item as surfboard } from '../items/surfboard';
import { item as sandFlag } from '../items/sand-flag';

/**
 * Beach batch c5 (the Batch column of docs/game/items-beach.md):
 * water-slide, volleyball-court, beach-pavilion, shell-ice-cream, bbq-grill, welcome-sign, surfboard, sand-flag.
 * Owned by the c5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-5` on the dev server. Check: `npx vitest run src/themes/beach/batches/c5.test.ts`.
 */
export const items: readonly ItemModel[] = [waterSlide, volleyballCourt, beachPavilion, shellIceCream, bbqGrill, welcomeSign, surfboard, sandFlag];
