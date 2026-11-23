import type { ItemModel } from '../../../models/contract';
import { item as musicCorner } from '../items/music-corner';
import { item as coffeeRoaster } from '../items/coffee-roaster';
import { item as flowerWall } from '../items/flower-wall';
import { item as piano } from '../items/piano';
import { item as bicycleDisplay } from '../items/bicycle-display';
import { item as jukebox } from '../items/jukebox';
import { item as grandfatherClock } from '../items/grandfather-clock';
import { item as coatRack } from '../items/coat-rack';

/**
 * Café batch k6 (the Batch column of docs/game/items-cafe.md):
 * music-corner, coffee-roaster, flower-wall, piano, bicycle-display, jukebox, grandfather-clock, coat-rack.
 * Owned by the k6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-6` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k6.test.ts`.
 */
export const items: readonly ItemModel[] = [musicCorner, coffeeRoaster, flowerWall, piano, bicycleDisplay, jukebox, grandfatherClock, coatRack];
