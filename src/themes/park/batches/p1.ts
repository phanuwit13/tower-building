import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p1 (the Batch column of docs/game/items-park.md):
 * swan-boat-lake, fountain-plaza, koi-pond, splash-pad, stepping-stones, stream, swan, toy-sailboat, drinking-fountain.
 * Owned by the p1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-1` on the dev server. Check: `npx vitest run src/themes/park/batches/p1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
