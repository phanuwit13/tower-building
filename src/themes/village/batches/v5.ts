import type { ItemModel } from '../../../models/contract';
import { item as village_market } from '../items/village-market';
import { item as coffee_stall } from '../items/coffee-stall';
import { item as som_tam_stall } from '../items/som-tam-stall';
import { item as fruit_stall } from '../items/fruit-stall';
import { item as bamboo_rice_grill } from '../items/bamboo-rice-grill';
import { item as sidecar_motorbike } from '../items/sidecar-motorbike';
import { item as clay_stove } from '../items/clay-stove';
import { item as bicycle } from '../items/bicycle';

/**
 * Village batch v5 (the Batch column of docs/game/items-village.md):
 * village-market, coffee-stall, som-tam-stall, fruit-stall, bamboo-rice-grill, sidecar-motorbike, clay-stove, bicycle.
 * Owned by the v5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-5` on the dev server. Check: `npx vitest run src/themes/village/batches/v5.test.ts`.
 */
export const items: readonly ItemModel[] = [village_market, coffee_stall, som_tam_stall, fruit_stall, bamboo_rice_grill, sidecar_motorbike, clay_stove, bicycle];
